/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Simple structured logger that ensures sensitive information
 * (like passwords or cleartext emails when appropriate) is not accidentally logged.
 */

type LogLevel = 'info' | 'warn' | 'error';

interface LogPayload {
  message: string;
  [key: string]: any;
}

function sanitizePayload(payload: LogPayload): LogPayload {
  const sanitized = { ...payload };
  const sensitiveKeys = ['password', 'token', 'secret', 'credential', 'email'];
  
  for (const key of Object.keys(sanitized)) {
    if (sensitiveKeys.some(sk => key.toLowerCase().includes(sk))) {
      sanitized[key] = '[REDACTED]';
    } else if (sanitized[key] instanceof Error) {
      sanitized[key] = {
        message: sanitized[key].message,
        stack: sanitized[key].stack,
        name: sanitized[key].name,
      };
    }
  }
  return sanitized;
}

function log(level: LogLevel, payload: LogPayload) {
  const sanitized = sanitizePayload(payload);
  const logString = JSON.stringify({
    timestamp: new Date().toISOString(),
    level,
    ...sanitized,
  });

  switch (level) {
    case 'info':
      console.log(logString);
      break;
    case 'warn':
      console.warn(logString);
      break;
    case 'error':
      console.error(logString);
      break;
  }
}

export const logger = {
  info: (payload: LogPayload | string) => log('info', typeof payload === 'string' ? { message: payload } : payload),
  warn: (payload: LogPayload | string) => log('warn', typeof payload === 'string' ? { message: payload } : payload),
  error: (payload: LogPayload | string) => log('error', typeof payload === 'string' ? { message: payload } : payload),
};
