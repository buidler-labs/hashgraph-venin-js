const LEVELS = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    verbose: 4,
    debug: 5,
    silly: 6
};

export class StratoLogger {
    constructor(params) {
        this._level = LEVELS[params.logger.level];
        this._isLoggingEnabled = params.logger.enabled;
    }
  
    get isSillyLoggingEnabled() {
        return this._isLevelEnabled(LEVELS.silly);
    }
  
    debug(message, ...meta) {
        if (this._isLevelEnabled(LEVELS.debug)) console.debug(message, ...meta);
        return this;
    }
    error(message, ...meta) {
        if (this._isLevelEnabled(LEVELS.error)) console.error(message, ...meta);
        return this;
    }
    info(message, ...meta) {
        if (this._isLevelEnabled(LEVELS.info)) console.info(message, ...meta);
        return this;
    }
    silly(message, ...meta) {
        if (this._isLevelEnabled(LEVELS.silly)) console.debug(message, ...meta);
        return this;
    }
    verbose(message, ...meta) {
        if (this._isLevelEnabled(LEVELS.verbose)) console.debug(message, ...meta);
        return this;
    }
    warn(message, ...meta) {
        if (this._isLevelEnabled(LEVELS.warn)) console.warn(message, ...meta);
        return this;
    }

    _isLevelEnabled(level) {
        return this._isLoggingEnabled && this._level >= level;
    };
}
    