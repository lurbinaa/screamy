import { CommandCtx } from "@bot";
import { manager } from "@manager";

export default {
    description: "Ping command",
    execute: async (context: CommandCtx): Promise<void> => {
        const { postgres, redis } = await manager.database.ping();
        const discord = isFinite(manager.bot.latency) ? `${manager.bot.latency}ms` : 'pending...';

        return context.reply('bot.commands.ping.pong', {
            discord,
            postgres: postgres.toFixed(),
            redis: redis.toFixed()
        });
    }
};