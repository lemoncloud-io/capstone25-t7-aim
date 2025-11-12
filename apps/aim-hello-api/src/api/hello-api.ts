/**
 * `hello-api.ts`
 * - service endpoint for `/hello`
 *
 *
 * @author      Steve Jung <steve@lemoncloud.io>
 * @date        2025-10-10 initial version with `lemon-core#4.0.7`
 *
 * @copyright   (C) lemoncloud.io 2025 - All Rights Reserved. (https://eureka.codes)
 */
import { $T, $U, _log, NextHandler, GeneralWEBController, NextContext } from 'lemon-core';
import { Model, TestModel } from '../service/model';
import { HelloService } from '../service/service';
import { generateRefactoredCode } from '../service/gemini-service';
import { AimException, ErrorCode } from '../../../../packages/shared/src/errors';
const NS = $U.NS('hello', 'yellow'); // NAMESPACE TO BE PRINTED.

/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * class: `HelloAPIController`
 * - handle of `/hello` type
 *
 * support basic CRUD operations.
 * - GET    /hello         => list-all
 * - GET    /hello/:id     => get-one
 * - POST   /hello/:id     => create-new (at position :id)
 * - PUT    /hello/:id     => update-existing (at position :id)
 * - DELETE /hello/:id     => delete-existing (at position :id)
 * - GET    /hello/:id/say => get-one with say command.
 */
export class HelloAPIController extends GeneralWEBController {
    /** sample data */
    private BUFF: TestModel[] = [
        {
            name: '1st',
        },
    ];

    /**
     * default constructor.
     */
    public constructor(readonly service?: HelloService) {
        super('hello');
        _log(NS, `HelloAPIController()...`);

        const tableName = $U.env('MY_DYNAMO_TABLE');
        this.service = service ?? new HelloService(tableName);
        _log(NS, `> tableName = ${tableName}`);
    }

    /**
     * name of this resource.
     */
    public hello = () => `hello-api-controller:${this.type()}`;

    /**
     * transform from model to view.
     */
    public modelAsView = <T extends Model>(model: T) => $U.cleanup({ ...model }) as T;

    /**
     * list hello
     *
     * ```sh
     * $ http ':8000/hello'
     */
    public doList: NextHandler = async (id, param, body, context) => {
        const errScope = `doList(${this.type()}/${id ?? ''})`;
        _log(NS, `${errScope} ...`);
        const name = $U.env('NAME'); // read via process.env
        const list = this.BUFF?.map((N, i) => this.modelAsView({ id: `${i}`, name: N.name }));
        return { name, list };
    };

    /**
     * get hello hello
     *
     * ```sh
     * $ http ':8000/hello/0'
     */
    public doGet: NextHandler = async (id, param, body, context) => {
        const errScope = `doGet(${this.type()}/${id ?? ''})`;
        _log(NS, `${errScope} ...`);
        const i = $U.N(id, 0);
        const val = this.BUFF[i];
        if (val === undefined) throw new AimException(ErrorCode.NOT_FOUND);
        return this.modelAsView({ ...val, id: `${i}` });
    };

    /**
     * Only Update with incremental support
     *
     * ```sh
     * $ echo '{"name":1}' | http PUT ':8000/hello/0'
     * $ http PUT ':8000/hello/0' name=1
     */
    public doPut: NextHandler = async (id, param, body, context) => {
        const errScope = `doPut(${this.type()}/${id ?? ''})`;
        _log(NS, `${errScope} ...`);
        const node = await this.doGet(id, null, null, context);
        const i = $U.N(node?.id, 0);
        this.BUFF[i] = { ...node, ...body };
        return this.modelAsView(this.BUFF[i]);
    };

    /**
     * Insert new Node at position 0.
     *
     * ```sh
     * $ http :8000/hello/0 name=hello
     */
    public doPost: NextHandler = async (id, param, body, context) => {
        const errScope = `doPost(${this.type()}/${id ?? ''})`;
        _log(NS, `${errScope} ...`);
        if (id == 'echo') return this.doPostEcho('0', param, body, context);

        //* append into array.
        _log(NS, errScope);
        const i = $U.N(id, 0);
        if (i) throw new AimException(ErrorCode.INVALID_INPUT);
        if (!body?.name) throw new AimException(ErrorCode.INVALID_INPUT);
        const name = $T.S2(body?.name, '', ' ').trim(); // clear new-lines
        const model: TestModel = { name, _id: `${this.BUFF.length}` };
        this.BUFF.push(model);

        // returns the last-index.
        return this.modelAsView({ ...model, id: `${this.BUFF.length - 1}` });
    };

    /**
     * echo the request.
     *
     * ```sh
     * $ http :8000/hello/0/echo name=hello
     */
    public doPostEcho: NextHandler = async (id, param, body, $ctx) => {
        const errScope = `doPostEcho(${this.type()}/${id ?? ''})`;
        _log(NS, `${errScope} ...`);
        const context = $T.onlyDefined<NextContext>({
            domain: $ctx?.domain,
            clientIp: $ctx?.clientIp,
            userAgent: $ctx?.userAgent,
            authorization: $ctx?.authorization,
            referer: $ctx?.referer,
            cookie: $ctx?.cookie,
        });
        return { id, cmd: 'echo', param, body, context };
    };

    /**
     * Delete Node (or mark deleted)
     *
     * ```sh
     * $ http DELETE ':8000/hello/1'
     */
    public doDelete: NextHandler = async (id, param, body, context) => {
        const errScope = `doDelete(${this.type()}/${id ?? ''})`;
        _log(NS, `${errScope} ...`);

        // find, and delete by index
        const node = await this.doGet(id, null, null, context);
        const i = $U.N(node?.id, 0);
        delete this.BUFF[i];
        return this.modelAsView(node);
    };

    /**
     * handler for gemini requests. (cmd = 'gemini')
     * 이제 이 메소드가 'cmd'가 'gemini'인 모든 요청을 받습니다.
     * 'id' 값으로 분기 처리를 합니다.
     *
     * ```sh
     * $ http POST ':8000/hello/refactor-code/gemini' keyword=... s3Url=...
     * ```
     */
    public doPostGemini: NextHandler = async (id, param, body, context) => {
        const errScope = `doPostGemini(${this.type()}/${id ?? ''})`;
        _log(NS, `${errScope} ...`);

        // [수정] 'id' 값으로 분기합니다.
        if (id == 'refactor-code') {
            const s3Url = body?.s3Url;

            if (!s3Url) {
                throw new AimException(ErrorCode.INVALID_INPUT);
            }

            _log(NS, `[DEBUG] Received S3 URL: ${s3Url}`);

            try {
                // Call Gemini ZIP analysis service
                const result = await generateRefactoredCode({ s3Url });
                _log(NS, `[DEBUG] Code refactoring completed successfully`);

                return result;
            } catch (error) {
                _log(NS, `[ERROR] Code refactoring failed: ${error}`);
                throw new AimException(ErrorCode.AI_REFACTORING_FAILED);
            }
        }

        // 예시: /hello/world/gemini 요청
        if (id == 'world') {
            return { body };
        }

        // 일치하는 'id'가 없을 경우
        _log(NS, `!WARN! Unhandled id in doPostGemini: ${id}`);
        throw new AimException(ErrorCode.NOT_FOUND, `Unknown gemini command: ${id}`);
    };
}

//*export as default.
export default new HelloAPIController();
