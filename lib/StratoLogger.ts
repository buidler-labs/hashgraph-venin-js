import { 
    createLogger, 
    format, 
    Logger,
    transports
} from "winston";
import { StratoRuntimeParameters } from "./StratoRuntimeParameters";

export class StratoLogger {
  private readonly isLoggingEnabled: boolean;
  private readonly logger: Logger;

  public constructor(params: StratoRuntimeParameters) {
      const level = params.logger.level;
      
      this.isLoggingEnabled = params.logger.enabled;
      this.logger = createLogger({
          format: format.combine(
              format.timestamp(),
              format.printf(({ level, message, timestamp }) => {
                  return `${timestamp} - ${level}: ${message}`;
              })
          ), level,
          transports: [ new transports.Console({ silent: !this.isLoggingEnabled })]
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
  