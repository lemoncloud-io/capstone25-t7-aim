/**
 * `model.ts`
 * - model definitions..
 *
 *
 * @author      Steve Jung <steve@lemoncloud.io>
 * @date        2025-10-10 initial version with `lemon-core#4.0.7`
 *
 * @copyright   (C) lemoncloud.io 2025 - All Rights Reserved. (https://eureka.codes)
 */
import { CoreModel } from 'lemon-model';
//WARN - DO NOT IMPORT FROM `../../service/backend-model`
// import { ModelType } from '../../service/backend-types';
import { keys } from 'ts-transformer-keys';
import $LUT from './types';

/**
 * type: `ModelType`
 */
export type ModelType = keyof typeof $LUT.ModelType;

/**
 * class: `Model`
 *  - common model definitions
 *
 * @see https://github.com/kimamula/ts-transformer-keys
 */
export type Model = CoreModel<ModelType>;

/**
 * type: `TestModel`
 * - internal test model.
 */
export interface TestModel extends Model {
    /**
     * id of model
     */
    id?: string;
    /**
     * stereo-type of model
     */
    stereo?: string;
    /**
     * name
     */
    name?: string;
    /**
     * internal test count
     */
    count?: number;

    /**
     * (readonly) view.
     */
    readonly Model?: Model; // inner Object.
}

/**
 * extract field names from models
 * - only fields start with lowercase, or all upper.
 */
export const filterFields = (fields: string[], base: string[] = []) =>
    fields
        .filter(field => field !== '_id' && /^[a-z_][a-zA-Z0-9_]+/.test(field))
        .reduce<string[]>(
            (L, k) => {
                if (k && !L.includes(k)) L.push(k);
                return L;
            },
            [...base],
        );

//*extended fields set of sub-class.
export const $FIELD = {
    test: filterFields(keys<TestModel>()),
};
