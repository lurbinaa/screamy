import { manager } from "@manager";
import { CommandInteraction, type AnyInteraction } from "eris";

export default async function (interaction: AnyInteraction) {
    if (interaction instanceof CommandInteraction) {
        await interaction.createMessage('hello');
    }
}