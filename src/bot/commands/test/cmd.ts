import { Client, CommandInteraction } from "eris";

export default {
    description: "Test command",

    execute: (bot: Client, interaction: CommandInteraction): void => {
        interaction.createMessage("Pong!");
    },
};
