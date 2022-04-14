import { expect, describe, it } from '@jest/globals';
import { FileId } from '@hashgraph/sdk';
import { ApiSession } from '../../../lib/ApiSession';

import { Json } from '../../../lib/static/upload/Json';

describe('LiveJson', () => {
  it('given a valid Json instance, uploading it should succede', async () => {
    const { session } = await ApiSession.default();
    const jsonToUpload = new Json({ a: 'abc', b: { c: 2 } });
    const liveJson = await session.upload(jsonToUpload);

    expect(liveJson.a).toEqual('abc');
    expect(liveJson.b).toEqual({ c: 2 });
  });

  it('given a valid Json-convertable upload argument, uploading it should succede', async () => {
    const { session } = await ApiSession.default();
    const liveJson = await session.upload({ a: 1, b: { c: 42 } });

    expect(liveJson.a).toEqual(1);
    expect(liveJson.b).toEqual({ c: 42 });
  });

  it('given an invalild Json-convertable upload argument, uploading it should fail', async () => {
    const { session } = await ApiSession.default();

    await expect(session.upload({ _a: 3 })).rejects.toThrow();
    await expect(session.upload({ id: 420 })).rejects.toThrow();
  });

  it('uploading a Json data-structure should allow subsequent retrievals of it', async () => {
    const { session } = await ApiSession.default();
    const uploadedLiveJson = await session.upload({
      a: 'some text',
      b: { c: 42.0 },
    });
    const retrievedLiveJson = await session.getLiveJson({
      id: uploadedLiveJson.id,
    });

    expect(uploadedLiveJson.a).toEqual(retrievedLiveJson.a);
    expect(uploadedLiveJson.b).toEqual(retrievedLiveJson.b);
  });

  it('getting info for a file, the information about the file is correctly fetched', async () => {
    const { session } = await ApiSession.default();
    const uploadedLiveJson = await session.upload({
      a: 'some text',
      b: { c: 42.0 },
    });
    const retrievedLiveJson = await session.getLiveJson({
      id: uploadedLiveJson.id,
    });

    const jsonInfo = await retrievedLiveJson.getLiveEntityInfo();
    expect(jsonInfo).not.toBeNull();
    expect(jsonInfo.fileId).toBeInstanceOf(FileId);
  });
});
