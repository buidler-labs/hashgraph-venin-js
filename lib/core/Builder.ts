export interface Builder<O> {
    build(): Promise<O>;
}