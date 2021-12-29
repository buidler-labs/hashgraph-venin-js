import { LiveJson } from "../live/LiveJson";
import { ArgumentsOnFileUploaded, UploadableEntity } from "./UploadableEntity";

/**
 * A data-holder class that can source the creation of a {@link LiveJson} persisted on the [Hedera File Service (HFS)](https://docs.hedera.com/guides/docs/sdks/file-storage)
 */
export class Json extends UploadableEntity<LiveJson> {
    /**
     * Checks to see if a piece of data can be referenced by a {@link Json} object or not.
     * 
     * @param {object} jInfo - info-param to check 
     * @returns - true if the data is {@link Json} referenceable and false otherwise
     */
    public static isInfoAcceptable(jInfo: object): boolean {
        try {
            Json._guardForInvalid(jInfo);
            return true;
        } catch (e) {
            // No-op
         }
        return false;
    }

    private static _guardForInvalid(jInfo: object) {
        if (jInfo === null || typeof jInfo !== 'object') {
            throw new Error("Please provide a valid JSON object to instantiate a static Json with.");
        } else {
            const containsInvalidKeys = Object.keys(jInfo).find(jInfoKey => 
                jInfoKey.length > 0 && (jInfoKey[0] === '_' || jInfoKey === 'id')
            ) !== undefined;

            if (containsInvalidKeys) {
                throw new Error("Static Jsons can only be constructed from JSON objects whos properties dont't start with '_' or has the 'id' naming.");
            }
        }
    }

    /**
     * Tries to construct the a new {@link Json} instance that hosts the provided info. Throws an error if, for any reason, the provided data cannot be Json-referenced.
     * 
     * @param info - the payload to reference
     */
    public constructor(private readonly info: object) {
        super();
        Json._guardForInvalid(info);
    }

    protected override async _getContent() {
        return JSON.stringify(this.info);
    }

    protected override async _onFileUploaded({ client, receipt, args = [] }: ArgumentsOnFileUploaded) {
        return new LiveJson({
            client,
            id: receipt.fileId,
            data: this.info
        });
    }
}