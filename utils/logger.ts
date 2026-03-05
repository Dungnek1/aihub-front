const isDev = process.env.NODE_ENV === "development";

interface LogContext {
  module?: string;
  function?: string;
  [key: string]: unknown;
}

const formatContext = (context?: LogContext): string => {
  if (!context) return "";
  const parts: string[] = [];
  if (context.module) parts.push(`[${context.module}]`);
  if (context.function) parts.push(`${context.function}()`);
  return parts.length > 0 ? `${parts.join(" ")} ` : "";
};

export const logger = {
  error: (message: string, ...args: unknown[]) => {
    if (isDev) {
      const context =
        typeof args[0] === "object" && args[0] !== null && "module" in args[0]
          ? (args[0] as LogContext)
          : undefined;
      const restArgs = context ? args.slice(1) : args;
      console.error(`❌ ${formatContext(context)}${message}`, ...restArgs);
    }
  },
  warn: (message: string, ...args: unknown[]) => {
    if (isDev) {
      const context =
        typeof args[0] === "object" && args[0] !== null && "module" in args[0]
          ? (args[0] as LogContext)
          : undefined;
      const restArgs = context ? args.slice(1) : args;
      console.warn(`⚠️ ${formatContext(context)}${message}`, ...restArgs);
    }
  },
  log: (message: string, ...args: unknown[]) => {
    if (isDev) {
      const context =
        typeof args[0] === "object" && args[0] !== null && "module" in args[0]
          ? (args[0] as LogContext)
          : undefined;
      const restArgs = context ? args.slice(1) : args;
      console.log(`ℹ️ ${formatContext(context)}${message}`, ...restArgs);
    }
  },
  debug: (message: string, ...args: unknown[]) => {
    if (isDev) {
      const context =
        typeof args[0] === "object" && args[0] !== null && "module" in args[0]
          ? (args[0] as LogContext)
          : undefined;
      const restArgs = context ? args.slice(1) : args;
      console.debug(`🔍 ${formatContext(context)}${message}`, ...restArgs);
    }
  },
};

export type { LogContext };
