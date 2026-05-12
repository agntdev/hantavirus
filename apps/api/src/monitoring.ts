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

export type LaunchMetricSnapshot = {
  averageLatencyMs: number;
  checkedAt: string;
  criticalErrorsLastHour: number;
  databaseReady: boolean;
  openFeedbackItems: number;
  version: string;
};

export type LaunchStatus = {
  alerts: Array<{
    message: string;
    next_action: string;
    severity: 'critical' | 'warning';
  }>;
  post_launch_actions: string[];
  signals: LaunchMetricSnapshot;
  status: 'blocked' | 'ready' | 'watch';
};

const FEEDBACK_BACKLOG_WARNING = 25;
const LATENCY_WARNING_MS = 1200;

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

export function buildLaunchStatus(signals: LaunchMetricSnapshot): LaunchStatus {
  const alerts: LaunchStatus['alerts'] = [];

  if (!signals.databaseReady) {
    alerts.push({ message: 'Database readiness check failed.', next_action: 'Hold launch traffic until the database is reachable.', severity: 'critical' });
  }

  if (signals.criticalErrorsLastHour > 0) {
    alerts.push({ message: `${signals.criticalErrorsLastHour} critical API errors in the last hour.`, next_action: 'Inspect error logs by request id and patch or roll back.', severity: 'critical' });
  }

  if (signals.averageLatencyMs > LATENCY_WARNING_MS) {
    alerts.push({ message: `Average API latency is ${signals.averageLatencyMs}ms.`, next_action: 'Review slow routes and database query plans.', severity: 'warning' });
  }

  if (signals.openFeedbackItems > FEEDBACK_BACKLOG_WARNING) {
    alerts.push({ message: `${signals.openFeedbackItems} unresolved feedback items need triage.`, next_action: 'Triage user feedback and pick the next post-launch update batch.', severity: 'warning' });
  }

  const hasCriticalAlert = alerts.some((alert) => alert.severity === 'critical');

  return {
    alerts,
    post_launch_actions: [
      'Review unresolved user feedback daily.',
      'Keep rollback notes and deployment artifacts current.',
      'Promote critical fixes before new feature work.'
    ],
    signals,
    status: hasCriticalAlert ? 'blocked' : alerts.length > 0 ? 'watch' : 'ready'
  };
}
