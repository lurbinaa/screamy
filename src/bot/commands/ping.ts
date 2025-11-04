import { CommandCtx } from "@bot";

export default {
    description: "Ping command",
    execute: async (context: CommandCtx): Promise<void> => {
        return context.reply('bot.commands.ping.pong');
    }
};