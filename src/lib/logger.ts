import * as Sentry from '@sentry/nextjs';

type LogLevel = 'info' | 'warn' | 'error';

interface LogContext {
  userId?: string;
  botId?: string;
  transactionId?: string;
  [key: string]: unknown;
}

class Logger {
  private log(level: LogLevel, message: string, context?: LogContext) {
    const timestamp = new Date().toISOString();
    const logEntry = { timestamp, level, message, context };

    // Console logging
    console[level](`[${timestamp}] ${level.toUpperCase()}:`, message, context);

    // Sentry for errors
    if (level === 'error') {
      Sentry.captureException(new Error(message), {
        extra: context,
        user: context?.userId ? { id: context.userId } : undefined,
      });
    }

    // Send to logging service (e.g., LogRocket, Datadog)
    if (process.env.NODE_ENV === 'production') {
      this.sendToRemote(logEntry);
    }
  }

  private sendToRemote(entry: unknown) {
    // يمكن الربط بـ Axiom, Logtail, أو أي خدمة
    fetch(process.env.LOG_ENDPOINT!, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry),
    }).catch(() => {});
  }

  info(message: string, context?: LogContext) {
    this.log('info', message, context);
  }

  warn(message: string, context?: LogContext) {
    this.log('warn', message, context);
  }

  error(message: string, context?: LogContext) {
    this.log('error', message, context);
  }
}

export const logger = new Logger();