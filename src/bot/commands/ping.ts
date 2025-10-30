import { CommandInteraction } from "eris";
import i18next from "i18next";

export default {
    description: "Ping command",

    execute: async (
        interaction: CommandInteraction,
        lng: string,
    ): Promise<void> => {
        await interaction.createMessage(i18next.t("ping.reply", { lng }));
    },
};
