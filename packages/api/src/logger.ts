import winston from "winston";

const { combine, timestamp, printf, colorize, errors, json } = winston.format;

const isProduction = process.env.NODE_ENV === "production";

const devFormat = printf(({ level, message, timestamp, stack, reqId, ...metadata }) => {
  const prefix = reqId ? `[${reqId}] ` : "";
  let msg = `${timestamp} [${level}]: ${prefix}${message}`;
  if (Object.keys(metadata).length > 0) {
    msg += ` ${JSON.stringify(metadata)}`;
  }
  if (stack) {
    msg += `\n${stack}`;
  }
  return msg;
});

function createTransports() {
  const transports: winston.transport[] = [];

  if (isProduction) {
    transports.push(
      new winston.transports.File({
        filename: "logs/labas-error.log",
        level: "error",
        format: combine(timestamp(), errors({ stack: true }), json()),
        maxsize: 10 * 1024 * 1024,
        maxFiles: 14,
      }),
      new winston.transports.File({
        filename: "logs/labas-combined.log",
        format: combine(timestamp(), errors({ stack: true }), json()),
        maxsize: 10 * 1024 * 1024,
        maxFiles: 7,
      }),
    );
  }

  transports.push(
    new winston.transports.Console({
      format: isProduction
        ? combine(timestamp(), errors({ stack: true }), json())
        : combine(colorize(), timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), errors({ stack: true }), devFormat),
    }),
  );

  return transports;
}

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL ?? "info",
  defaultMeta: { service: "labas-api" },
  transports: createTransports(),
});

export function withRequestId(reqId: string) {
  return logger.child({ reqId });
}
