import { LiveFile, LiveFileConstructorArgs } from "./LiveFile";

/**
 * Represents a Hedera, HFS-managed, Json object
 */
export class LiveJson extends LiveFile {
  
  readonly [k: string]: any;

  constructor({ session, id, data }: LiveFileConstructorArgs) {
    super({data, id, session});
    if(typeof data === 'string'){
      data = JSON.parse(data);
    }
    // Dynamically bind 'data' properties to instance
    Object.keys(data).forEach(jDataKey => Object.defineProperty(this, jDataKey, {
      enumerable: true,
      value: data[jDataKey],
      writable: false,
    }));
  }
}
