
export type NamedValue<T> = {
  name: string,
  value: T
};

export type RecursivePartial<T> = {
  [P in keyof T]?:
    T[P] extends (infer U)[] ? RecursivePartial<U>[] :
    T[P] extends object ? RecursivePartial<T[P]> :
    T[P];
};

/** 
 * A value which could either be it or a promise to it.
 */
export type Promised<T> = T | Promise<T>;
