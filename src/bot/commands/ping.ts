import { CommandCtx } from "@bot";
import { manager } from "@manager";

export default {
    description: 'Ping command',
    execute: async (context: CommandCtx): Promise<void> => {
        await context.defer();

        const { postgres, redis } = await manager.database.ping();
        const discord = isFinite(manager.bot.latency) ? `${manager.bot.latency}ms` : 'pending...';

        await context.followUp('bot.commands.ping.pong', {
            discord,
            postgres: postgres.toFixed(),
            redis: redis.toFixed()
        });
    }
};