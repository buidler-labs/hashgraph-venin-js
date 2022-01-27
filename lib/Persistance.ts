export interface Saver<S> {
    save(): Promise<S>;
}

export interface Restorer<S, O extends Saver<S>> {
    restore(state: S): Promise<O>;
}
