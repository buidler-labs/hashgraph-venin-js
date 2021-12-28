import { LiveJson } from "../live/LiveJson";
import { ArgumentsOnFileUploaded, UploadableEntity } from "./UploadableEntity";

export class Json extends UploadableEntity<LiveJson> {
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