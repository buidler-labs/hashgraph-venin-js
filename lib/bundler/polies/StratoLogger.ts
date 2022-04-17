/* eslint-env browser */

import EventEmitter from "events";

import { LoggerRuntimeParameters } from "../../StratoContext";

const LEVELS = {
  error: 0,
  warn: 1,
  // eslint-disable-next-line sort-keys
  info: 2,
  // eslint-disable-next-line sort-keys
  http: 3,
  verbose: 4,
  // eslint-disable-next-line sort-keys
  debug: 5,
  silly: 6,
};

export class StratoLogger extends EventEmitter {
  private readonly level: number;
  private readonly isLoggingEnabled: boolean;

  constructor(params: LoggerRuntimeParameters) {
    super();
    this.level = LEVELS[params.level];
    this.isLoggingEnabled = params.enabled;
  }

  get isSillyLoggingEnabled() {
    return this._isLevelEnabled(LEVELS.silly);
  }

  debug(message, ...meta) {
    if (this._isLevelEnabled(LEVELS.debug))
      this.emit("debug", message, ...meta);
    return this;
  }
  error(message, ...meta) {
    if (this._isLevelEnabled(LEVELS.error))
      this.emit("error", message, ...meta);
    return this;
  }
  info(message, ...meta) {
    if (this._isLevelEnabled(LEVELS.info)) this.emit("info", message, ...meta);
    return this;
  }
  silly(message, ...meta) {
    if (this._isLevelEnabled(LEVELS.silly))
      this.emit("debug", message, ...meta);
    return this;
  }
  verbose(message, ...meta) {
    if (this._isLevelEnabled(LEVELS.verbose))
      this.emit("debug", message, ...meta);
    return this;
  }
  warn(message, ...meta) {
    if (this._isLevelEnabled(LEVELS.warn)) this.emit("warn", message, ...meta);
    return this;
  }

  _isLevelEnabled(level) {
    return this.isLoggingEnabled && this.level >= level;
  }
}
