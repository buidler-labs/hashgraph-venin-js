import { ApiSession } from "../ApiSession";

/**
 * Common functionality exhibited by session-bounded, id-entifiable LiveEntity instances.
 */
export abstract class LiveEntity<T,I> {
    constructor(
        public readonly session: ApiSession,
        public readonly id: T
    ) {}

    protected get log() {
        return this.session.log;
    }

    public equals<R>(what: R|LiveEntity<T, I>): boolean {
        if (what instanceof LiveEntity) {
            return what.id === this.id;
        }
        return this._equals(what);
    }

    protected _equals<R>(what: R): boolean {
        return false;
    }

    public abstract getInfo(): Promise<I>;
}