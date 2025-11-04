import pino, {
    type Logger,
    type LoggerOptions,
    destination,
    multistream,
    type StreamEntry,
} from "pino";
import path from "path";
import { prettyTransport } from "@lib/utils";
import { PRODUCTION } from "@lib/constants";

const baseConfig: LoggerOptions = {
    level: PRODUCTION ? "info" : "debug",
    timestamp: () => `,"time":"${new Date(Date.now()).toISOString()}"`,
};

const fileTransport = destination({
    dest: path.join(process.cwd(), "logs/app.jsonl"),
    mkdir: true,
    sync: false,
});

const streams: StreamEntry[] = PRODUCTION
    ? [{ stream: fileTransport, level: "info" }]
    : [
        { stream: fileTransport, level: "debug" },
        { stream: prettyTransport, level: "debug" },
    ];

const logger: Logger = pino(baseConfig, multistream(streams));

/**   creates a child logger with a specific context */
const withContext = (context: string): Logger => logger.child({ context });

export { type Logger, logger, withContext };
