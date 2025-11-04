import { Client } from "eris";
import { withContext, type Logger } from "@lib/core";
import { extractCommandFiles, getCommands, loadEvents } from "./handlers";
import { PRODUCTION } from "@lib/constants";
import type { CommandCollection, CommandExecutionsCollection } from "@lib/types";

export class Bot extends Client {
    /**    `null` until commands are loaded */
    public commands: CommandCollection | null;
    public commandExecutions: CommandExecutionsCollection | null;
    public logger: Logger

    public constructor() {
        super(Bun.env.DISCORD_BOT_TOKEN!, {
            intents: ["guilds", "guildMessages"]
        });
        this.commands = null;
        this.commandExecutions = null;
        this.logger = withContext('Bot');
    }

    public async init(): Promise<void> {
        await loadEvents(this);
        await this.connect();
        await this.loadCommands();
    }

    public async loadCommands(): Promise<void> {
        const files = await extractCommandFiles('src/bot/commands');
        const { commands, executeCollection } = await getCommands(files);

        this.commands = commands;
        this.commandExecutions = executeCollection;
    }

    public async uploadCommands(): Promise<void> {
        if (!this.commands) {
            this.logger.error('No commands are saved in collection');
            return;
        }

        try {
            if (PRODUCTION) {
                await this.bulkEditCommands(this.commands);
                this.logger.info('Upload global commands');
            } else {
                const guildId = Bun.env.DEV_GUILD;
                if (!guildId) {
                    this.logger.error("Environment is set to development, but DEV_GUILD wasn't provided");
                    return;
                }

                await this.bulkEditGuildCommands(guildId, this.commands)
                this.logger.info({ guildId }, 'Uploaded guild commands')
            }
        } catch (error) {
            this.logger.error(error, 'Error while uploading commands');
        }
    }
}