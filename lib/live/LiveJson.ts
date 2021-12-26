import { Client, FileId } from "@hashgraph/sdk";

type LiveJsonConstructorArgs = {
    client: Client,
    id: FileId,
    data: object
};

/**
 * Represents a Hedera, HFS-managed Json object
 * 
 * TODO: add SDK methods to make this trully live 
 */
export class LiveJson {
    private readonly client: Client;
    public readonly id: FileId;

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