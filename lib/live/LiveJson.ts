import { FileId } from "@hashgraph/sdk";
import { ApiSession } from "../ApiSession";
import { LiveEntity } from "./LiveEntity";

type LiveJsonConstructorArgs = {
    session: ApiSession,
    id: FileId,
    data: object
};

/**
 * Represents a Hedera, HFS-managed Json object
 */
export class LiveJson implements LiveEntity {
    private readonly session: ApiSession;
    public readonly id: FileId;
    readonly [ k: string ]: any;

    constructor({ session, id, data }: LiveJsonConstructorArgs) {
        this.session = session;
        this.id = id;
        
        // Dynamically bind jData properties to instance
        Object.keys(data).forEach(jDataKey => Object.defineProperty(this, jDataKey, {
            enumerable: true,
            value: data[jDataKey],
            writable: false,
        }));
    }
}