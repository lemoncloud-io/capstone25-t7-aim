/**
 * `service.spec.ts`
 * - test spec for `service`
 *
 *
 * @author      Steve Jung <steve@lemoncloud.io>
 * @date        2025-10-10 initial version with `lemon-core#4.0.7`
 *
 * @copyright   (C) lemoncloud.io 2025 - All Rights Reserved. (https://eureka.codes)
 */
import { loadProfile } from 'lemon-core/dist/environ';
import { expect2 } from 'lemon-core';

//* import main models and service.
import { HelloService } from './service';

//*create service instance.
export const instance = (table = 'dummy', current?: number) => {
    current = current ?? new Date().getTime();
    const service = new HelloService(table === 'dummy' ? 'dummy-table.yml' : table);
    service.setCurrent(current);
    return { service, current };
};

//*main test body.
describe('hello-service /w dummy', () => {
    it('should pass hello()', async () => {
        const PROFILE = loadProfile(process); // override process.env.
        PROFILE && console.info(`! PROFILE =`, PROFILE);
        const { service } = instance('dummy');
        expect2(() => service.hello()).toEqual('hello-service');
    });

    //*test service w/ dummy data
    it('should pass test-manager w/ storage', async () => {
        const { service } = instance('dummy');

        //*test service marking
        expect2(service.hello()).toEqual('hello-service');
        const FIELDS = (
            'id,stereo,name,count,' +
            'ns,type,sid,uid,gid,lock,next,meta,' +
            'createdAt,updatedAt,deletedAt,' +
            'error'
        )
            .split(',')
            .map(s => s.trim());
        expect2(() => service.$test.hello()).toEqual(
            `typed-storage-service:test/proxy-storage-service:dummy-storage-service:dummy-table/_id`,
        );
        expect2(() => service.$test.FIELDS).toEqual([...FIELDS]);
    });
});
