import { FileInfo, Status } from '@hashgraph/sdk';
import { describe, expect, it } from '@jest/globals';

import { ApiSession } from '../../../lib/ApiSession';
import { LiveFile } from '../../../lib/live/LiveFile';

describe('LiveFile', () => {
  it('given a string, a file is created from that string', async () => {
    const fileContent = 'this is a string';
    const fileContentBuffer = Buffer.from(fileContent);

    const { session } = await ApiSession.default();
    const liveFile = await session.upload(fileContent);

    expect(liveFile).toBeInstanceOf(LiveFile);
    expect(await liveFile.getContents()).toEqual(fileContentBuffer);
  });

  it("building a file from it's file id, the content is queried and returned as expected.", async () => {
    const fileContent = 'this is a string';
    const fileContentBuffer = Buffer.from(fileContent);

    const { session } = await ApiSession.default();
    const liveFile = await session.upload(fileContent);

    const liveFileFromId = new LiveFile({ id: liveFile.id, session });

    const contents = await liveFileFromId.getContents();

    expect(contents).toEqual(fileContentBuffer);
  });

  it("building a file from it's file id string, LiveFile is created as expected", async () => {
    const fileContent = 'this is a string';

    const { session } = await ApiSession.default();
    const liveFile = await session.upload(fileContent);

    const liveFileFromId = new LiveFile({
      id: liveFile.id.toString(),
      session,
    });

    const info = await liveFileFromId.getLiveEntityInfo();

    expect(info.fileId).toEqual(liveFile.id);
  });

  it('getting the solidity address from LiveFile, returns the expected address string', async () => {
    const fileContent = 'this is a string';

    const { session } = await ApiSession.default();
    const liveFile = await session.upload(fileContent);

    expect(liveFile.getSolidityAddress()).toEqual(
      liveFile.id.toSolidityAddress()
    );
  });

  it('updating the contents of an existing file, the file returns the right contents.', async () => {
    const fileContent = 'this is a string';

    const { session } = await ApiSession.default();
    const liveFile = await session.upload(fileContent);

    const updatedContent = 'this is another string';
    const updatedContentBuffer = Buffer.from(updatedContent);

    const status = await liveFile.updateEntity({ contents: updatedContent });

    expect(status).toEqual(Status.Success);

    const contents = await liveFile.getContents();

    expect(contents).toEqual(updatedContentBuffer);
  });

  it('deleting an existing file returns success.', async () => {
    const fileContent = 'this is a string';

    const { session } = await ApiSession.default();
    const liveFile = await session.upload(fileContent);

    const status = await liveFile.deleteEntity();

    expect(status).toEqual(Status.Success);
  });

  it('getting the info of an existing file, returns FileInfo', async () => {
    const fileContent = 'this is a string';

    const { session } = await ApiSession.default();
    const liveFile = await session.upload(fileContent);

    const info = await liveFile.getLiveEntityInfo();

    expect(info).toBeInstanceOf(FileInfo);
    expect(info.fileId).toEqual(liveFile.id);
  });
});
