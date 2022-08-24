// This module holds generic functionality that belongs nowhere.
// Always be mindful when adding code here and try to refactor and group the functionality into something more meaningful.
// This project is not fond of utility classes.

import { ObjectEntries } from "./UsefulTypes";

/**
 * A generic mapper that transforms something to something else.
 * If what needs to be transformed is a plain, non-array, value, it just transforms it.
 * If it's an array, the transformation applies to all its elements.
 * If it's a deep nested array (array within an array), the transformation applies to the leaf elements.
 *
 * @param what The thing that will get transformed
 * @param into The transformer
 * @returns Transforms what into something else
 */
export function transform(what: [] | any, into: (arg: any) => any) {
  return Array.isArray(what)
    ? what.map((el) => transform(el, into))
    : into(what);
}

/**
 * Safe, typed, way to use `Object.entries` to extract a vector of typed entries.
 *
 * @param obj The object to unpack
 * @returns An array of entries of type T the make up the object `obj`
 */
export function typedObjectEntries<T>(obj: T): ObjectEntries<T> {
  return Object.entries(!obj ? {} : obj) as any;
}
