/**
 * `service.ts`
 * - common service definitions
 *
 *
 * @author      Steve Jung <steve@lemoncloud.io>
 * @date        2025-10-10 initial version with `lemon-core#4.0.7`
 *
 * @copyright   (C) lemoncloud.io 2025 - All Rights Reserved. (https://eureka.codes)
 */
import { $U, _log, CoreManager, CoreService, GeneralItem } from 'lemon-core';
import { $FIELD, Model, ModelType, TestModel } from './model';
const NS = $U.NS('hello', 'blue'); // NAMESPACE TO BE PRINTED.

/**
 * class: `HelloService`
 * - sample service for `hello` type.
 */
export class HelloService extends CoreService<Model, ModelType> {
    public readonly $test: MyTestManager;

    /**
     * default constructor w/ optional parameters.
     *
     * @param tableName target table-name, or dummy `.yml` file.
     * @param params optional parameters.
     */
    public constructor(tableName?: string) {
        super(tableName);
        _log(NS, `HelloService(${this.tableName}, ${this.NS})...`);
        this.$test = new MyTestManager(this);
    }

    /**
     * hello.
     */
    public hello = () => `hello-service`;
}

/**
 * class: `MyCoreManager`
 * - shared core manager for all model.
 * - handle 'name' like unique value in same type.
 */
// eslint-disable-next-line prettier/prettier
export class MyCoreManager<T extends Model, S extends CoreService<T, ModelType>> extends CoreManager<T, ModelType, S> {
    public readonly parent: S;
    public constructor(type: ModelType, parent: S, fields: string[], uniqueField?: string) {
        super(type, parent, fields, uniqueField);
        this.parent = parent;
    }

    /** say hello */
    public hello = () => `${this.storage.hello()}`;

    /**
     * get model by id
     */
    public async getModelById(id: string): Promise<T> {
        return this.storage.read(id).catch(e => {
            if (`${e.message}`.startsWith('404 NOT FOUND')) throw new Error(`404 NOT FOUND - ${this.type}:${id}`);
            throw e;
        });
    }

    /**
     * validate name format
     * - just check empty string.
     * @param name unique name in same type group.
     */
    public validateName = (name: string): boolean => (this.$unique ? this.$unique.validate(name) : true);

    /**
     * convert to internal id by name
     * @param name unique name in same type group.
     */
    public asIdByName = (name: string): string => (this.$unique ? this.$unique.asLookupId(name) : null);

    /**
     * lookup model by name
     * - use `stereo` property to link with the origin.
     *
     * @param name unique name in same type group.
     */
    public findByName = async (name: string): Promise<T> => {
        if (this.$unique) return this.$unique.findOrCreate(name);
        throw new Error(`400 NOT SUPPORT - ${this.type}:#${name}`);
    };
}

/**
 * class: `MyTestManager`
 * - manager for test-model.
 */
export class MyTestManager extends MyCoreManager<TestModel, HelloService> {
    public constructor(parent: HelloService) {
        super('test', parent, $FIELD.test, 'name');
    }
    /**
     * Save data into DynamoDB
     */
    public saveToDynamo = async (id: string, data: GeneralItem) => {
        const res = await this.save(id, data);
        return { res };
    };
    /**
     * Read data from DynamoDB
     */
    public readFromDynamo = async (id: string) => {
        const res = await this.getModelById(id);
        return { res };
    };
}

//*export default
export default new HelloService();
