// src/utils/logger.ts

/**
 * =============================================================================
 * Logger Utility
 * =============================================================================
 *
 * **File:** `src/utils/logger.ts`
 *
 * **Description:**
 * Provides a robust logging utility for Deno applications, enabling logging to both
 * the console and a dynamically named log file. Each log entry includes a timestamp
 * and source information (function name, file path, line, and column).
 *
 * **Features:**
 * - **Log Levels:** `DEBUG`, `INFO`, `WARNING`, `ERROR`, `CRITICAL`
 * - **Dual Handlers:** Console and file logging with different formats
 * - **Custom Formatting:** ISO timestamp and source info for console; structured JSON for file
 * - **Automatic Log File Naming:** Based on the calling script's name
 *
 * **Installation:**
 * Ensure Deno has permissions to read/write files and access URLs.
 *
 * **Usage:**
 *
 * 1. **Import the Logger:**
 *    ```typescript
 *    import logger from "./utils/logger.ts";
 *    ```
 *
 * 2. **Log Messages:**
 *    ```typescript
 *    logger.debug("Debug message");
 *    logger.info("Info message");
 *    logger.warning("Warning message");
 *    logger.error("Error message");
 *    logger.critical("Critical message");
 *    ```
 *
 * **API Reference:**
 *
 * - `debug(msg: string, ...args: any[])`
 * - `info(msg: string, ...args: any[])`
 * - `warning(msg: string, ...args: any[])`
 * - `error(msg: string, ...args: any[])`
 * - `critical(msg: string, ...args: any[])`
 *
 * **Log Message Formats:**
 * - **Console:**
 *   ```
 *   2024-04-27T12:34:56.789Z INFO Message (FunctionName (/path/to/file.ts:42:13)) - {"key":"value"}
 *   ```
 * - **File (JSONL):**
 *   ```json
 *   {"datetime":"2024-04-27T12:34:56.789Z","level":"INFO","msg":"Message","sourceInfo":"FunctionName (/path/to/file.ts:42:13)","extra":{"key":"value"}}
 *   ```
 *
 * **Configuration:**
 * - **Log File Path:** Automatically determined based on the calling script
 * - **Handlers:**
 *   - **ConsoleHandler:** Minimum level `INFO`, human-readable format
 *   - **FileHandler:** Minimum level `DEBUG`, structured JSON format
 *
 * **Notes:**
 * - Ensure necessary permissions for file operations.
 * - Source info capture via stack trace may impact performance.
 *
 * **Example Integration:**
 *
 * ```typescript
 * // src/main.ts
 * import logger from "./utils/logger.ts";
 *
 * function authenticateUser(userId: number) {
 *   logger.info("Authentication started", { userId });
 *   // Logic...
 *   logger.info("Authentication successful", { userId });
 * }
 *
 * authenticateUser(123);
 * ```
 *
 * =============================================================================
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
import { config } from '../../config.ts';

// Helper function to truncate strings
function truncate(value: any, maxLength: number = config.maxLogEntryLength): string {
  const strValue = typeof value === "string" ? value : JSON.stringify(value);
  if (strValue.length <= maxLength) {
    return strValue;
  }
  const halfLength = Math.floor(maxLength / 2);
  // Get first half and last half, adding "..." in between
  const truncated = strValue.substring(0, halfLength) + " !!!TRUNCATED!!! " + strValue.substring(strValue.length - halfLength);
  return truncated;
}

// Function to get log file path based on the calling script
function getLogFilePath(): string {
  const scriptUrl = Deno.mainModule;
  const scriptPath = fromFileUrl(scriptUrl);
  const scriptDir = dirname(scriptPath);
  const scriptName = basename(scriptPath, extname(scriptPath));
  const logFilePath = join(scriptDir, `${scriptName}.log`);
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



try {
  // Get log file path
  const logFilePath = getLogFilePath();

  // Configure the logger with console and file handlers
  await setup({
    handlers: {
      console: new handlers.ConsoleHandler("INFO", {
        formatter: consoleFormatter,
      }),
      file: new handlers.FileHandler("DEBUG", {
        filename: logFilePath,
        mode: "w", // Could change to append mode to allow continuous logging
        // Ensure that the formatter is correctly assigned
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
} catch (error) {
  console.error("Failed to configure logger:", error);
  Deno.exit(1);
}

// Get the default logger
const logger = getLogger();

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
