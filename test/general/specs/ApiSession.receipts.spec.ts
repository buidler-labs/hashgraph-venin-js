import { describe, expect, it, jest } from '@jest/globals';

import { ApiSession } from '../../../lib/ApiSession';

describe('ApiSession.Receipts', () => {
  it('uploading a json should generate appropriate receipts', async () => {
    const { session } = await ApiSession.default();

    return new Promise<void>((accept) => {
      session.subscribeToReceiptsWith(({ receipt }) => {
        expect(receipt.fileId).not.toBeNull();
        accept();
      });
      expect(session.upload({ a: 1 })).resolves.not.toBeNull();
    });
  });
});
