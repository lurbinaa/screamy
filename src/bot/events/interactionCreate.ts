import {
    CommandInteraction,
    Constants,
    type AnyInteraction,
    type CommandInteractionData,
    type InteractionDataOptionsSubCommand,
    type InteractionDataOptionsSubCommandGroup
} from "eris";
import { CommandCtx } from "@bot";
import { manager } from "@manager";

const { SUB_COMMAND, SUB_COMMAND_GROUP } = Constants.ApplicationCommandOptionTypes;

export default async function (interaction: AnyInteraction): Promise<void> {
    if (interaction instanceof CommandInteraction) {
        const locale = await getLocale(interaction);
        const context = new CommandCtx(interaction, locale);
        if (!manager.bot.commandExecutions) return context.silentReply('bot.errors.commands_not_loaded');

        const name = getNameKey(interaction.data);
        const executeFn = manager.bot.commandExecutions.get(name);

        if (!executeFn) {
            manager.bot.logger.error(interaction.data, 'Command not found in execution collection')
            return context.silentReply('bot.errors.command_not_found');
        }

        await executeFn(context);
        manager.bot.logger.debug(
            {
                name,
                guild: interaction.guildID,
                channel: interaction.channel.id
            },
            'Command ran'
        );
    }
}

function getNameKey(data: CommandInteractionData): string {
    if (
        !data.options ||
        (
            data.options[0]?.type !== SUB_COMMAND &&
            data.options[0]?.type !== SUB_COMMAND_GROUP
        )
    ) {
        return data.name;
    }

    const first = data.options[0] as InteractionDataOptionsSubCommand | InteractionDataOptionsSubCommandGroup;
    const child = first.options?.[0];

    const keys = [data.name, first.name];
    if (first.type === SUB_COMMAND_GROUP && child?.name) keys.push(child.name);

    return keys.join("-");
}

async function getLocale(interaction: CommandInteraction): Promise<string | null> {
    const fromUser = await manager.database.members.getLocale(interaction.member!.id, interaction.guildID!);
    if (fromUser) return fromUser;

    const fromGuild = await manager.database.guilds.getLocale(interaction.guildID!);
    return fromGuild;
}