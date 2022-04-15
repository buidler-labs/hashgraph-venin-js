import { Logger, createLogger, format, transports } from "winston";
import { LoggerRuntimeParameters } from "./StratoContext";
import { SPLAT } from "triple-beam";

export class StratoLogger {
  private readonly isLoggingEnabled: boolean;
  private readonly logger: Logger;

  public constructor(params: LoggerRuntimeParameters) {
    const level = params.level;

    this.isLoggingEnabled = params.enabled;
    this.logger = createLogger({
      format: format.combine(
        format.timestamp(),
        format.printf(({ timestamp, level, message, [SPLAT]: meta }) => {
          let log = `${timestamp} - ${level}: ${message}`;

          if (meta[0] && meta[0].length > 0) {
            log += `, ${JSON.stringify(meta[0])}`;
          }
          return log;
        })
      ),
      level,
      transports: [new transports.Console({ silent: !this.isLoggingEnabled })],
    });
  }

  public get isSillyLoggingEnabled() {
    return this.isLoggingEnabled && this.logger.isSillyEnabled();
  }

  public debug(message: string, ...meta: any[]): StratoLogger {
    this.logger.debug(message, meta);
    return this;
  }
  public error(message: string, ...meta: any[]): StratoLogger {
    this.logger.error(message, meta);
    return this;
  }
  public info(message: string, ...meta: any[]): StratoLogger {
    this.logger.info(message, meta);
    return this;
  }
  public silly(message: string, ...meta: any[]): StratoLogger {
    this.logger.silly(message, meta);
    return this;
  }
  public verbose(message: string, ...meta: any[]): StratoLogger {
    this.logger.verbose(message, meta);
    return this;
  }
  public warn(message: string, ...meta: any[]): StratoLogger {
    this.logger.warn(message, meta);
    return this;
  }
}
