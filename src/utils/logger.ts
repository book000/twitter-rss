import winston, { format } from 'winston'
import WinstonDailyRotateFile from 'winston-daily-rotate-file'
import { Format } from 'logform'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import cycle from 'cycle'

export class Logger {
  private readonly logger: winston.Logger

  private constructor(logger: winston.Logger) {
    this.logger = logger
  }

  public debug(message: string, metadata?: Record<string, unknown>): void {
    this.logger.debug(message, metadata || {})
  }

  public info(message: string, metadata?: Record<string, unknown>): void {
    this.logger.info(message, metadata || {})
  }

  public warn(message: string, error?: Error): void {
    this.logger.warn(message, error)
  }

  public error(message: string, error?: Error): void {
    this.logger.error(message, error)
  }

  public static configure(category: string): Logger {
    // env.LOG_LEVEL でログレベルを指定できる (デフォルト info)
    // env.LOG_FILE_LEVEL でファイル出力のログレベルを指定できる (デフォルト info)
    // env.LOG_DIR でログ出力先を指定できる (デフォルト logs)
    // env.LOG_FILE_MAX_AGE でログファイルの最大保存期間を指定できる (デフォルト 30d)
    // env.LOG_FILE_FORMAT でログファイルのフォーマットを指定できる (デフォルト text)
    const logLevel = process.env.LOG_LEVEL || 'info'
    const logFileLevel = process.env.LOG_FILE_LEVEL || 'info'
    const logDirectory = process.env.LOG_DIR || 'logs'
    const logFileMaxAge = process.env.LOG_FILE_MAX_AGE || '30d'
    const selectLogFileFormat = process.env.LOG_FILE_FORMAT || 'text'

    const textFormat = format.printf((info) => {
      const { timestamp, level, message, ...rest } = info
      const filteredRest = Object.keys(rest).reduce((accumulator, key) => {
        if (key === 'stack') {
          return accumulator
        }
        return {
          ...accumulator,
          [key]: rest[key],
        }
      }, {})
      const standardLine = [
        '[',
        timestamp,
        '] [',
        category ?? '',
        category ? '/' : '',
        level.toLocaleUpperCase(),
        ']: ',
        message,
        Object.keys(filteredRest).length > 0
          ? ` (${JSON.stringify(filteredRest)})`
          : '',
      ].join('')
      const errorLine = info.stack
        ? info.stack.split('\n').slice(1).join('\n')
        : undefined

      return [standardLine, errorLine].filter((l) => l !== undefined).join('\n')
    })
    const logFileFormat =
      selectLogFileFormat === 'ndjson' ? format.json() : textFormat
    const decycleFormat = format((info) => cycle.decycle(info))
    const fileFormat = format.combine(
      ...([
        format.errors({ stack: true }),
        selectLogFileFormat === 'ndjson'
          ? format.colorize({
              message: true,
            })
          : format.uncolorize(),
        decycleFormat(),
        format.timestamp({
          format: 'YYYY-MM-DD hh:mm:ss.SSS',
        }),
        logFileFormat,
      ].filter((f) => f !== undefined) as Format[])
    )
    const consoleFormat = format.combine(
      ...([
        format.colorize({
          message: true,
        }),
        decycleFormat(),
        format.timestamp({
          format: 'YYYY-MM-DD hh:mm:ss.SSS',
        }),
        textFormat,
      ].filter((f) => f !== undefined) as Format[])
    )
    const extension = selectLogFileFormat === 'ndjson' ? 'ndjson' : 'log'
    const transportRotateFile = new WinstonDailyRotateFile({
      level: logFileLevel,
      dirname: logDirectory,
      filename: `%DATE%.` + extension,
      datePattern: 'YYYY-MM-DD',
      maxFiles: logFileMaxAge,
      format: fileFormat,
      auditFile: `${logDirectory}/audit.json`,
    })

    const logger = winston.createLogger({
      transports: [
        new winston.transports.Console({
          level: logLevel,
          format: consoleFormat,
        }),
        transportRotateFile,
      ],
    })
    return new Logger(logger)
  }
}

process.on('unhandledRejection', (reason) => {
  const logger = Logger.configure('main')
  logger.error('unhandledRejection', reason as Error)
})
process.on('uncaughtException', (error) => {
  const logger = Logger.configure('main')
  logger.error('uncaughtException', error)
})
