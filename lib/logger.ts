type LogLevel = "info" | "warn" | "error" | "debug"

interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  context?: Record<string, any>
  userId?: string
}

class Logger {
  private static instance: Logger
  private logs: LogEntry[] = []
  private maxLogs = 1000
  private consoleEnabled = true
  private apiEnabled = true
  private apiEndpoint = "/api/logs"

  private constructor() {
    // Private constructor to enforce singleton pattern
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger()
    }
    return Logger.instance
  }

  public setConsoleLogging(enabled: boolean): void {
    this.consoleEnabled = enabled
  }

  public setApiLogging(enabled: boolean): void {
    this.apiEnabled = enabled
  }

  public setMaxLogs(max: number): void {
    this.maxLogs = max
  }

  public info(message: string, context?: Record<string, any>, userId?: string): void {
    this.log("info", message, context, userId)
  }

  public warn(message: string, context?: Record<string, any>, userId?: string): void {
    this.log("warn", message, context, userId)
  }

  public error(message: string, context?: Record<string, any>, userId?: string): void {
    this.log("error", message, context, userId)
  }

  public debug(message: string, context?: Record<string, any>, userId?: string): void {
    this.log("debug", message, context, userId)
  }

  private log(level: LogLevel, message: string, context?: Record<string, any>, userId?: string): void {
    const timestamp = new Date().toISOString()
    const logEntry: LogEntry = {
      timestamp,
      level,
      message,
      context,
      userId,
    }

    // Add to in-memory logs
    this.logs.push(logEntry)
    if (this.logs.length > this.maxLogs) {
      this.logs.shift() // Remove oldest log if we exceed max
    }

    // Console logging
    if (this.consoleEnabled) {
      const consoleMethod =
        level === "info"
          ? console.info
          : level === "warn"
            ? console.warn
            : level === "error"
              ? console.error
              : console.debug

      const formattedMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`
      if (context) {
        consoleMethod(formattedMessage, context)
      } else {
        consoleMethod(formattedMessage)
      }
    }

    // API logging (for server-side collection)
    if (this.apiEnabled && typeof window !== "undefined") {
      this.sendToApi(logEntry)
    }
  }

  private async sendToApi(logEntry: LogEntry): Promise<void> {
    try {
      await fetch(this.apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(logEntry),
      })
    } catch (error) {
      // Don't use this.log here to avoid potential infinite loops
      if (this.consoleEnabled) {
        console.error("Failed to send log to API:", error)
      }
    }
  }

  public getLogs(level?: LogLevel): LogEntry[] {
    if (level) {
      return this.logs.filter((log) => log.level === level)
    }
    return [...this.logs]
  }

  public clearLogs(): void {
    this.logs = []
  }
}

export const logger = Logger.getInstance()
