/**
 * `views.ts`
 * - type of views used in `transformer`
 *
 *
 * @author      Steve Jung <steve@lemoncloud.io>
 * @date        2025-10-10 initial version with `lemon-core#4.0.7`
 *
 * @copyright   (C) lemoncloud.io 2025 - All Rights Reserved. (https://eureka.codes)
 */
import { View, Body } from 'lemon-model';
import { TestModel } from './model';
import $LUT from './types';

//! export all internal types
export * from './types';
export default $LUT;
/**
 * Type `TestBody`
 */
export interface TestBody extends Body, Partial<TestView> {}
/**
 * type: `TestView`
 * - usually same as post's body.
 */
export interface TestView extends View, Omit<Partial<TestModel>, 'id' | 'required'> {
    /**
     * unique id of this type
     */
    id: string;

    /**
     * (optional) flag required.
     */
    required?: boolean;
}
