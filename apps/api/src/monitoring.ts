import { randomUUID } from 'node:crypto';
import type {
  ErrorRequestHandler,
  NextFunction,
  Request,
  RequestHandler,
  Response
} from 'express';

type AccessLogEntry = {
  duration_ms: number;
  event: 'http_request';
  method: string;
  path: string;
  request_id: string;
  status: number;
};

type ErrorLogEntry = {
  event: 'http_error';
  message: string;
  request_id: string;
};

type LogSink<T> = (entry: T) => void;

export function createRequestIdMiddleware(): RequestHandler {
  return (request, response, next) => {
    const requestId = request.get('x-request-id') || randomUUID();
    response.setHeader('X-Request-Id', requestId);
    next();
  };
}

export function createAccessLogMiddleware(
  logger: LogSink<AccessLogEntry> = (entry) => console.info(JSON.stringify(entry))
): RequestHandler {
  return (request, response, next) => {
    const startedAt = Date.now();

    response.on('finish', () => {
      logger({
        duration_ms: Date.now() - startedAt,
        event: 'http_request',
        method: request.method,
        path: request.originalUrl,
        request_id: String(response.getHeader('X-Request-Id') ?? ''),
        status: response.statusCode
      });
    });

    next();
  };
}

export function createNotFoundHandler(): RequestHandler {
  return (request, response) => {
    response.status(404).json({
      error: 'not_found',
      path: request.originalUrl
    });
  };
}

export function createErrorHandler(
  logger: LogSink<ErrorLogEntry> = (entry) => console.error(JSON.stringify(entry))
): ErrorRequestHandler {
  return (
    error: unknown,
    _request: Request,
    response: Response,
    _next: NextFunction
  ) => {
    const message = error instanceof Error ? error.message : 'Unhandled error';
    logger({
      event: 'http_error',
      message,
      request_id: String(response.getHeader('X-Request-Id') ?? '')
    });
    response.status(500).json({ error: 'internal_error' });
  };
}
