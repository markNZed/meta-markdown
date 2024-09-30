import { getLogger, setup } from "https://deno.land/std@0.201.0/log/mod.ts";
import { ConsoleHandler } from "https://deno.land/std@0.201.0/log/handlers.ts";

class GenericConsoleHandler extends ConsoleHandler {
  override format(logRecord: any): string {
    // Format the main message
    let formattedMessage = `${logRecord.levelName} ${logRecord.msg}`;

    // If there are extra arguments, format them as key-value pairs
    if (logRecord.args.length > 0) {
      const extraData = logRecord.args[0];
      const extraFormatted = Object.entries(extraData)
        .map(([key, value]) => `${key}: ${value}`)
        .join(", ");
      formattedMessage += ` - ${extraFormatted}`;
    }

    return formattedMessage;
  }
}

try {
  // Configure the logger with the generic handler
  setup({
    handlers: {
      console: new GenericConsoleHandler("DEBUG"),
    },
    loggers: {
      default: {
        level: "DEBUG",
        handlers: ["console"],
      },
    },
  });
} catch (error) {
  console.error("Failed to configure logger:", error);
  Deno.exit(1); // Exit the application if logging setup fails
}

// Get the default logger
const logger = getLogger();

export default logger;
