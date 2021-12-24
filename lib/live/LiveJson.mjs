/**
 * Represents a Hedera, HFS-managed Json object
 * 
 * TODO: add SDK methods to make this trully live 
 */
export class LiveJson {
    constructor({ client, id, data }) {
        this._client = client;
        this._id = id;
        
        // Dynamically bind jData properties to instance
        Object.keys(data).forEach(jDataKey => Object.defineProperty(this, jDataKey, {
            enumerable: true,
            value: data[jDataKey],
            writable: false,
        }));
    }

    get id() {
        return this._id;
    }
}