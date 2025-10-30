import { Transform } from "stream";
import chalk, { type ChalkInstance } from "chalk";

interface LogLevels {
    INFO: ChalkInstance;
    WARN: ChalkInstance;
    ERROR: ChalkInstance;
    [key: string]: ChalkInstance;
}

interface LogEntry {
    time: number | string;
    level: number;
    msg?: string;
    pid?: number;
    hostname?: string;
    v?: number;
    [key: string]: unknown;
}

const levels: LogLevels = {
    INFO: chalk.cyanBright,
    WARN: chalk.yellowBright,
    ERROR: chalk.redBright,
};

const LEVEL_MAPPING: Record<number, string> = {
    10: "TRACE",
    20: "DEBUG",
    30: "INFO",
    40: "WARN",
    50: "ERROR",
    60: "FATAL",
};

const formatDate = (timestamp: number | string): string => {
    const date = new Date(timestamp);
    return date.toLocaleString();
};

export const prettyTransport = new Transform({
    objectMode: true,
    transform(
        chunk: Buffer | string | LogEntry,
        _enc: BufferEncoding,
        cb: (error?: Error | null) => void,
    ) {
        try {
            const log: LogEntry =
                typeof chunk === "string" ? JSON.parse(chunk) : chunk;

            const timestamp = formatDate(log.time);
            const level =
                LEVEL_MAPPING[log.level] ||
                String(log.level || "INFO").toUpperCase();
            const color: ChalkInstance = levels[level] || chalk.white;
            const coloredLevel = color.bold(level.padEnd(5));
            const message = log.msg || "";
            const coloredMessage = color(message);

            const excludedKeys = [
                "time",
                "level",
                "msg",
                "pid",
                "hostname",
                "v",
            ];
            const contextEntries = Object.entries(log)
                .filter(([key]) => !excludedKeys.includes(key))
                .map(([key, val]) => {
                    let value: string;
                    if (val instanceof Error) {
                        value = val.message || val.toString();
                    } else if (typeof val === "object" && val !== null) {
                        try {
                            value = JSON.stringify(val, null, 2);
                        } catch (e) {
                            value = String(val);
                        }
                    } else {
                        value = String(val);
                    }
                    return `    ${chalk.bold(key)}: ${value}`;
                });

            const context =
                contextEntries.length > 0
                    ? `\n${contextEntries.join("\n")}`
                    : "";

            const output = `${chalk.gray(`[${timestamp}]`)} ${coloredLevel} ${coloredMessage}${context}\n`;
            process.stdout.write(output);
            cb();
        } catch (err) {
            console.error("Error en prettyTransport:", err);
            process.stdout.write(String(chunk) + "\n");
            cb();
        }
    },
});