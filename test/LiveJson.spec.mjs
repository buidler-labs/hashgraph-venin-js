import {
    expect, describe, it,
} from '@jest/globals';
import { HederaNetwork } from '../lib/HederaNetwork.mjs';

import { Json } from '../lib/static/Json.mjs';

describe('LiveJson', () => {
    it("given a valid Json instance, uploading it should succede", async () => {
        const hapiSession = await HederaNetwork.defaultApiSession();
        const jsonToUpload = new Json({ a: 'abc', b: { c: 2 } });
        const liveJson = await hapiSession.upload(jsonToUpload);

        expect(liveJson.a).toEqual('abc');
        expect(liveJson.b).toEqual({ c: 2 });
    });

    it("given a valid Json-convertable upload argument, uploading it should succede", async () => {
        const hapiSession = await HederaNetwork.defaultApiSession();
        const liveJson = await hapiSession.upload({ a: 1, b: { c: 42 } });

        expect(liveJson.a).toEqual(1);
        expect(liveJson.b).toEqual({ c: 42 });
    });

    it("given an invalild Json-convertable upload argument, uploading it should fail", async () => {
        const hapiSession = await HederaNetwork.defaultApiSession();
        
        await expect(hapiSession.upload({ _a: 3 })).rejects.toThrow();
        await expect(hapiSession.upload({ id: 420 })).rejects.toThrow();
    });

    it("uploading a Json data-structure should allow subsequent retrievals of it", async () => {
        const hapiSession = await HederaNetwork.defaultApiSession();
        const uploadedLiveJson = await hapiSession.upload({ a: "some text", b: { c: 42.0 } });
        const retrievedLiveJson = await hapiSession.getLiveJson({ id: uploadedLiveJson.id });

        expect(uploadedLiveJson.a).toEqual(retrievedLiveJson.a);
        expect(uploadedLiveJson.b).toEqual(retrievedLiveJson.b);
    });
});