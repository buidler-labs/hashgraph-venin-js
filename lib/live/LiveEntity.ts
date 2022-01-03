import { ApiSession } from "../ApiSession";

/**
 * Common functionality exhibited by session-bounded, id-entifiable LiveEntity instances.
 */
export class LiveEntity<T> {
    constructor(
        protected readonly session: ApiSession,
        public readonly id: T
    ) {}
}