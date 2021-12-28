import { Client, FileId } from "@hashgraph/sdk";
import { LiveEntity } from "./LiveEntity";

type LiveJsonConstructorArgs = {
    client: Client,
    id: FileId,
    data: object
};

/**
 * Represents a Hedera, HFS-managed Json object
 */
export class LiveJson implements LiveEntity {
    private readonly client: Client;
    public readonly id: FileId;
    readonly [ k: string ]: any;

    constructor({ client, id, data }: LiveJsonConstructorArgs) {
        this.client = client;
        this.id = id;
        
        // Dynamically bind jData properties to instance
        Object.keys(data).forEach(jDataKey => Object.defineProperty(this, jDataKey, {
            enumerable: true,
            value: data[jDataKey],
            writable: false,
        }));
    }
}