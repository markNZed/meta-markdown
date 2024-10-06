/**
 * @module Logger
 * 
 * This module sets up a logging system using Deno's standard logging library. It provides a logger instance with methods to log messages at various severity levels (debug, info, warning, error, critical). The logger captures source information, such as the calling function and file location, to provide context in log entries.
 * 
 * ## Usage
 * 
 * To use the logger, simply import the default export from this module and call the desired logging method:
 * 
 * ```typescript
 * import logger from '@/path/to/logger.ts';
 * 
 * logger.debug('This is a debug message');
 * logger.info('This is an info message', { additional: 'data' });
 * logger.warning('Warning message');
 * logger.error('An error occurred', { errorCode: 500 });
 * logger.critical('Critical issue detected');
 * ```
 * 
 * The logger automatically includes source information in the logs, and you can pass additional arguments which will be included in the log output.
 */

import {
  getLogger,
  handlers,
  setup,
} from "https://deno.land/std@0.201.0/log/mod.ts";
// Type-only import
import type { LogRecord } from "https://deno.land/std@0.201.0/log/mod.ts";
import {
  join,
  dirname,
  fromFileUrl,
  extname,
  basename,
} from "https://deno.land/std@0.201.0/path/mod.ts";
import { config } from '@/config.ts';

// Helper function to truncate strings
function truncate(value: any, maxLength: number = config.maxLogEntryLength): string {
  const strValue = typeof value === "string" ? value : JSON.stringify(value);
  if (strValue.length <= maxLength) {
    return strValue;
  }
  const halfLength = Math.floor(maxLength / 2);
  // Get first half and last half, adding "..." in between
  const truncated = "!!!TRUNCATED!!! " + strValue.substring(0, halfLength) + " ...TRUNCATED... " + strValue.substring(strValue.length - halfLength) + " !!!TRUNCATED!!!";
  return truncated;
}

// Function to get log file path based on the calling script
function getLogFilePath(): string {
  const scriptUrl = Deno.mainModule;
  const scriptPath = fromFileUrl(scriptUrl);
  const scriptDir = dirname(scriptPath);
  const scriptName = basename(scriptPath, extname(scriptPath));
  const logFilePath = join(scriptDir, `${scriptName}.log`);
  console.log("logFilePath", logFilePath)
  return logFilePath;
}

// Function to capture source info at the point of logging
function getSourceInfo(): string {
  const err = new Error();
  const stack = err.stack;
  if (stack) {
    const stackLines = stack.split("\n");
    // The stack trace format is:
    // [0]: Error
    // [1]: at getSourceInfo (...)
    // [2]: at <logging function> (...)
    // [3]: at <caller function> (...)
    // So we need to get the 4th line (index 3)
    if (stackLines.length >= 4) {
      const callerLine = stackLines[3];
      const match = callerLine.match(
        /\s+at\s+(.*?)\s+\((.*?):(\d+):(\d+)\)/,
      );
      if (match) {
        const functionName = match[1];
        const filePath = match[2];
        const lineNumber = match[3];
        const columnNumber = match[4];
        return `${functionName} (${filePath}:${lineNumber}:${columnNumber})`;
      } else {
        // Fallback in case the above regex doesn't match
        return callerLine.trim();
      }
    }
  }
  return "";
}

interface WithSourceInfo {
  sourceInfo: string;
  requestId: string;
  // Other properties can be added here if needed
}

// Extend LogRecord to specify args structure
interface LogRecordWithExtra extends LogRecord {
  args: [...unknown[]];
}

// Custom formatter for console handler (human-readable format)
function consoleFormatter(logRecord: LogRecordWithExtra): string {
  const datetime = logRecord.datetime.toLocaleTimeString([], {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  let sourceInfo = "";
  let requestId = "";
  const extraArgs: any[] = [];

  // Iterate over all objects in logRecord.args array
  if (logRecord.args && logRecord.args.length > 0) {
    logRecord.args.forEach((arg: any) => {
      if (typeof arg === "object") {
        Object.entries(arg).forEach(([key, value]) => {
          if (key === "sourceInfo") {
            sourceInfo = value as string;
          } else if (key === "requestId") {
            requestId = value as string;
          } else {
            extraArgs.push({ [key]: value });  // Treat other key-value pairs as extra arguments
          }
        });
      } else {
        // Collect non-object arguments as extra arguments
        extraArgs.push(arg);
      }
    });
  }

  // Build the formatted message
  let msg = `${datetime} ${logRecord.levelName.padEnd(5)} ${requestId} ${logRecord.msg} (${sourceInfo})`;

  // If there are extra arguments, append them
  if (extraArgs.length > 0) {
    const extraFormatted = extraArgs
      .map((value) => JSON.stringify(truncate(value)))
      .join(", ");
    msg += ` - ${extraFormatted}`;
  }

  return msg;
}


// Custom formatter for file handler (structured JSONL)
function jsonFileFormatter(logRecord: LogRecord): string {
  const datetime = logRecord.datetime.toLocaleTimeString([], {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  
  const logEntry: Record<string, any> = {
    datetime: datetime,
    level: logRecord.levelName.padEnd(5),
    msg: logRecord.msg,
  };

  const extraArgs: any[] = [];  // Array to hold non-object arguments

  if (logRecord.args && logRecord.args.length > 0) {
    logRecord.args.forEach((arg: any) => {
      if (typeof arg === "object" && arg !== null) {
        Object.entries(arg).forEach(([key, value]) => {
          if (key === "sourceInfo") {
            logEntry.sourceInfo = value;
          } else if (key === "requestId") {
            logEntry.requestId = value;
          } else {
            extraArgs.push({ [key]: value });  // Treat other key-value pairs as extra arguments
          }
        });
      } else {
        // Collect non-object arguments
        extraArgs.push(arg);
      }
    });

    // Attach any remaining non-object arguments as "extra"
    if (extraArgs.length > 0) {
      logEntry.extra = extraArgs;
    }
  }

  // Apply truncate function to all fields of logEntry
  const truncatedLogEntry = Object.fromEntries(
    Object.entries(logEntry).map(([key, value]) => [key, truncate(value)])
  );

  // Build the formatted message
  let msg = `${truncatedLogEntry.datetime} ${truncatedLogEntry.level} ${truncatedLogEntry.requestId + ' '|| ''}${truncatedLogEntry.msg} (${truncatedLogEntry.sourceInfo})`;

  // If there are extra arguments, append them
  if (logEntry.extra) {
    const extraFormatted = logEntry.extra
      .map((value: any) => JSON.stringify(truncate(value))) // Specify the type of 'value'
      .join(", ");
    msg += ` - ${extraFormatted}`;
  }

  return msg;

  //return JSON.stringify(truncatedLogEntry, null, 2);  // Return the truncated log entry
}
// Extend globalThis to include a logger setup flag and the logger instance
declare global {
  var __loggerSetup__: boolean;
  var __loggerInstance__: any;
}

if (!globalThis.__loggerSetup__) {
  globalThis.__loggerSetup__ = true;

  (async () => {
    try {
      const logFilePath = getLogFilePath();
      console.log(`Logger initialized. Log file path: ${logFilePath}`);

      await setup({
        handlers: {
          console: new handlers.ConsoleHandler("INFO", {
            formatter: consoleFormatter,
          }),
          file: new handlers.FileHandler("DEBUG", {
            filename: logFilePath,
            mode: "w", // Use append mode to prevent overwriting
            formatter: jsonFileFormatter,
          }),
        },
        loggers: {
          default: {
            level: "DEBUG",
            handlers: ["console", "file"],
          },
        },
      });

      globalThis.__loggerInstance__ = getLogger();
      console.log("Logger setup completed successfully.");
    } catch (error) {
      console.error("Failed to configure logger:", error);
      Deno.exit(1);
    }
  })();
}

// Wait for the logger to be initialized before exporting
// This ensures that logger is ready to use in the current cell
const waitForLogger = async () => {
  while (!globalThis.__loggerInstance__) {
    await new Promise((resolve) => setTimeout(resolve, 50)); // Wait 50ms
  }
};

// Immediately invoke the wait function to ensure logger is ready
await waitForLogger();

// Get the global logger instance
const logger = globalThis.__loggerInstance__;

// Wrapper functions to capture source info
const loggerWithSource = {
  debug: (msg: string, ...args: any[]) => {
    const sourceInfo = getSourceInfo();
    args.push({ sourceInfo });
    logger.debug(msg, ...args);
  },
  info: (msg: string, ...args: any[]) => {
    const sourceInfo = getSourceInfo();
    args.push({ sourceInfo });
    logger.info(msg, ...args);
  },
  warning: (msg: string, ...args: any[]) => {
    const sourceInfo = getSourceInfo();
    args.push({ sourceInfo });
    logger.warning(msg, ...args);
  },
  error: (msg: string, ...args: any[]) => {
    const sourceInfo = getSourceInfo();
    args.push({ sourceInfo });
    logger.error(msg, ...args);
  },
  critical: (msg: string, ...args: any[]) => {
    const sourceInfo = getSourceInfo();
    args.push({ sourceInfo });
    logger.critical(msg, ...args);
  },
  // Add other methods if needed
};

export default loggerWithSource;
