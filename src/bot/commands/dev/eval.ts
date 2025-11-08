import { Constants, type Message, type InteractionDataOptionsString, type InteractionDataOptionsSubCommand } from "eris";
import type { RawCommand } from "@lib/types";
import { CommandCtx } from "@bot";
import { manager } from "@manager";

const EvalCommand: RawCommand = {
    description: 'owner-only eval command',
    options: [{
        name: 'message_id',
        description: 'reference message id with code',
        type: Constants.ApplicationCommandOptionTypes.STRING,
        required: false
    }],
    execute: async (context: CommandCtx): Promise<void> => {
        if (context.interaction.member?.id !== Bun.env.OWNER_DISCORD_ID)
            return context.silentReply('bot.errors.owner_only');

        const messageId = ((context.options?.[0] as InteractionDataOptionsSubCommand)?.options?.[0] as InteractionDataOptionsString)?.value;
        let message: Message | undefined;

        if (messageId) message = await context.channel.getMessage(messageId).catch(() => undefined);
        else {
            /** check cache */
            const match = context.channel.messages.find(
                ({ content, member }) => isCodeblock(content) && member?.id !== manager.bot.user.id
            );
            if (match) message = match;
            else {
                const messages = await context.channel.getMessages({ limit: 20 });
                const match = messages.find(
                    ({ content, member }) => isCodeblock(content) && member?.id !== manager.bot.user.id
                );
                if (match) message = match
            }
        }

        if (!message) return context.silentReply('bot.commands.eval.message_not_found');

        try {
            console.log(message, message.content, cleanCodeblock(message.content))
            const result = await Promise.resolve(await eval(cleanCodeblock(message.content)));
            return context.reply('bot.commands.eval.success', {
                out: Bun.inspect(result, { colors: false, depth: 1 })
            });
        } catch (error) {
            return context.reply('bot.commands.eval.error', {
                error: Bun.inspect(error, { colors: false, depth: 0 })
            });
        }
    }
}

const codeblock = /```(?:\s*(?:js|ts|javascript|typescript))?(?:\r?\n)?([\s\S]*?)```/gi;

function isCodeblock(content: string): boolean {
    return Boolean(content.match(codeblock));
}

function cleanCodeblock(content: string): string {
    const cleanJumps = /^\n+|\n+$/g;
    return content.replace(codeblock, (_, code) => code.replace(cleanJumps, ''));
}

export default EvalCommand;