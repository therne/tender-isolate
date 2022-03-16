/**
 * Unlike [Object.assign] does override `null` and `undefined` values,
 * this method doesn't override nullish values.
 * x
 * @param target (e.g. a default option object)
 * @param sources (e.g. an user-given options)
 */
import { mergeWith } from 'https://deno.land/x/lodash@4.17.15-es/lodash.js';

export const assignWithoutNull = <T extends object, U>(target: T, ...sources: U[]): T & U =>
  mergeWith(target, ...sources, (a: any, b: any) => (b == null || isNaN(b) ? a : undefined));
