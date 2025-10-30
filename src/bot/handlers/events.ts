import { readdir } from "node:fs/promises";
import type { Bot } from "@bot";

export async function loadEvents(bot: Bot): Promise<void> {
    const files = await readdir('src/bot/events', {
        withFileTypes: true
    });

    for (const file of files) {
        if (file.isDirectory() || !file.name.includes('.ts')) continue;

        const eventName = file.name.slice(0, -3);
        const eventFn = (await import(`${file.parentPath}/${file.name}`).catch(() => null))?.default;

        if (!eventFn) {
            bot.logger.error(`${file.name} doesn't have a default function exported`);
            continue;
        }

        bot.on(eventName, eventFn);
    }
}