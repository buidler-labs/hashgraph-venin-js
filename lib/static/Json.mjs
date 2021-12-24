import { LiveJson } from "../live/LiveJson.mjs";
import { UploadableFile } from "../UploadableFile.mjs";

export class Json extends UploadableFile {
    static isInfoAcceptable(jInfo) {
        try {
            Json._guardForInvalid(jInfo);
            return true;
        } catch (e) {
            // No-op
         }
        return false;
    }

    /**
     * @private 
     */
    static _guardForInvalid(jInfo) {
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

    constructor(jInfo) {
        Json._guardForInvalid(jInfo);

        super();
        this._info = jInfo;
    }

    /**
     * @override
     * @protected
     */
    async _getContent() {
        return JSON.stringify(this._info);
    }

    /**
     * @override
     * @protected
     */
    async _onFileUploaded({ client, receipt, args = [] }) {
        return new LiveJson({
            client,
            id: receipt.fileId,
            data: this._info
        });
    }
}