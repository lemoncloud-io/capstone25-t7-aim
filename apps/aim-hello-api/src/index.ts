/**
 * `index.ts`
 * - main index to export
 *
 * **NOTE**
 * - DO `NOT EXPORT` ANY ADDITIONALS DUE TO TIME OF ENGINE INITIALIZER.
 *
 *
 * @author      Steve Jung <steve@lemoncloud.io>
 * @date        2025-10-10 initial version with `lemon-core#4.0.7`
 *
 * @copyright   (C) lemoncloud.io 2025 - All Rights Reserved. (https://eureka.codes)
 */
/** ********************************************************************************************************************
 *  Loading API Services.
 ** ********************************************************************************************************************/
/**
 * start engine intialize, and returns.
 */
export const engine = () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const $engine = require('./engine').default;
    return $engine;
};

/**
 * start load express, and returns
 */
export const express = () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const $express = require('./express').default;
    return $express;
};

/** ********************************************************************************************************************
 *  MAIN RUNNER
 *
 * # Usage
 * - required to run `$ npm run express.lemon`
 *
 * ```sh
 * # run express in local
 * $ node .
 * # batch run from 1 to 2 page.
 * $ node . -ep forms -sid lemon -cmd run -opt 'dummy=1' -ipp 1 -page 1~2
 * ```
 ** *******************************************************************************************************************/
if (typeof require !== 'undefined' && require.main === module) {
    // console.log('! argv =', process.argv);
    if (process.argv.length <= 2) {
        const $express = express();
        $express.createServer();
    } else {
        process.env['LS'] = '1';
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const run = require('lemon-core/dist/exec-cli').default;
        run();
    }
}
