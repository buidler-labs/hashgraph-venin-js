import {
  AccountCreateTransaction,
  AccountId,
  Hbar,
  Key,
  PrivateKey,
} from '@hashgraph/sdk';
import { BigNumber } from '@hashgraph/sdk/lib/Transfer';
import Duration from '@hashgraph/sdk/lib/Duration';

import { ApiSession, TypeOfExecutionReturn } from '../../ApiSession';
import { ArgumentsForCreate } from '../../core/CreatableEntity';
import { BasicCreatableEntity } from './BasicCreatableEntity';
import { LiveAccountWithPrivateKey } from '../../live/LiveAccount';
import { StratoLogger } from '../../StratoLogger';

export enum KeyType {
  ECDSA,
  ED25519,
  Unknown,
}

export type AccountFeatures = {
  keyType?: KeyType;
  key?: Key;
  receiverSignatureRequired?: boolean;
  proxyAccountId?: AccountId;
  autoRenewPeriod?: number | Long.Long | Duration;
  accountMemo?: string;
  maxAutomaticTokenAssociations?: number | Long.Long;
};

export type CreateAccountFeatures = AccountFeatures & {
  initialBalance?: string | number | Long.Long | BigNumber | Hbar;
};

export class Account extends BasicCreatableEntity<LiveAccountWithPrivateKey> {
  public static async mapAccountFeaturesToAccountArguments<
    T extends AccountFeatures
  >(session: ApiSession, features: T): Promise<T> {
    // we are looking to generate a key if a keyType exists on the AccountFeatures
    if (features.keyType !== null) {
      const key = await Account.considerGenerateKeyFromAccountFeatures(
        session.log,
        features
      );
      return Object.assign({}, features, { key });
    }
    return features;
  }

  /**
   * @param logger - StratoLogger to log information of the created key
   * @param features - AccountFeatures being used to find out what type of key needs to be generated
   * @returns - the key for the new account
   */
  public static async considerGenerateKeyFromAccountFeatures<
    T extends AccountFeatures
  >(logger: StratoLogger, features: T): Promise<PrivateKey> {
    let keyToReturn = features.key as PrivateKey;

    if (!features.key) {
      const { keyType } = features;
      const keyTypeString =
        keyType === KeyType.ED25519
          ? KeyType[KeyType.ED25519]
          : KeyType[KeyType.ECDSA];

      keyToReturn =
        keyType === KeyType.ED25519
          ? await PrivateKey.generateED25519Async()
          : await PrivateKey.generateECDSAAsync();
      logger.debug(
        `A new '${keyTypeString}' key has been created: ${keyToReturn.toStringDer()} . Copy it since this is only time you'll see it.`
      );
    }
    return keyToReturn;
  }

  private key: PrivateKey;
  private accountFeatures: CreateAccountFeatures;

  public constructor(info?: CreateAccountFeatures) {
    super('Account');
    this.accountFeatures = {
      keyType: KeyType.ED25519,
      ...info,
    };
  }

  public async createVia({
    session,
  }: ArgumentsForCreate): Promise<LiveAccountWithPrivateKey> {
    let resolutedInfo: AccountFeatures;
    if (this.key) {
      resolutedInfo = Object.assign({}, this.accountFeatures, {
        key: this.key,
      });
    }
    resolutedInfo = await Account.mapAccountFeaturesToAccountArguments(
      session,
      this.accountFeatures
    );
    const createAccountTransaction = new AccountCreateTransaction(
      resolutedInfo
    );
    const { accountId } = await session.execute(
      createAccountTransaction,
      TypeOfExecutionReturn.Receipt,
      true
    );

    return new LiveAccountWithPrivateKey({
      id: accountId,
      privateKey: resolutedInfo.key as PrivateKey,
      session,
    });
  }
}
