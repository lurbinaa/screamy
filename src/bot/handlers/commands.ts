import { readdir } from "node:fs/promises";
import { Constants } from "eris";
import { CommandTypes } from "@/lib/types"
import type {
    Command,
    CommandFile,
    RawCommand,
    Execute,
    ApplicationCommandOptionsSubCommand,
    ApplicationCommandOptionsSubCommandGroup,
    GetCommandsOutput
} from "@/lib/types";

export async function getCommands(commandFiles: CommandFile[]): Promise<GetCommandsOutput> {
    const commands: Command<CommandTypes.Main>[] = [];
    const executeCollection = new Map<string, Execute>();

    for (const raw of commandFiles) {
        const [name, sub, group] = raw.keys;
        const data = (await import(raw.path).catch(() => null))?.default as RawCommand;

        if (!data || !name) continue;

        executeCollection.set(raw.keys.join('-'), data.execute!); // keys in kebab-case
        delete data.execute;
        data.description ??= 'No description';

        switch (raw.keys.length - 1) {
            case CommandTypes.Main:
                commands.push({
                    name,
                    type: Constants.ApplicationCommandTypes.CHAT_INPUT,
                    ...data as RawCommand<CommandTypes.Main>
                });
                continue;
            case CommandTypes.SubCommand: {
                const parent = commands.find(c => c.name === sub);
                const option = {
                    name,
                    description: data.description,
                    type: CommandTypes.SubCommand
                } as ApplicationCommandOptionsSubCommand;

                if (!parent) {
                    commands.push({
                        name: sub!,
                        description: data.description,
                        type: Constants.ApplicationCommandTypes.CHAT_INPUT,
                        options: [option]
                    });
                    continue;
                }
                parent.options?.push(option);
                continue;
            }
            case CommandTypes.SubCommandGroup:
                const grand = commands.find(c => c.name === group);
                const option = {
                    name,
                    description: data.description,
                    type: CommandTypes.SubCommand,
                    options: data.options
                } as ApplicationCommandOptionsSubCommand;
                const childOption = {
                    name: sub,
                    description: data.description,
                    type: CommandTypes.SubCommandGroup,
                    options: [option]
                } as ApplicationCommandOptionsSubCommandGroup;

                if (!grand) {
                    commands.push({
                        name: group!,
                        description: data.description,
                        type: Constants.ApplicationCommandTypes.CHAT_INPUT,
                        options: [childOption]
                    });
                    continue;
                }

                const parent = grand.options?.find(o => o?.name === sub) as ApplicationCommandOptionsSubCommandGroup;
                if (!parent) {
                    grand.options?.push(childOption);
                    continue;
                }

                parent.options?.push(option);
        }
    }

    return {
        commands,
        executeCollection
    }
}

export async function extractCommandFiles(path: string): Promise<CommandFile[]> {
    const commandFiles: CommandFile[] = [];
    const files = await readdir(path, {
        recursive: true,
        withFileTypes: true
    });

    for (const file of files) {
        if (file.isDirectory() || !file.name.includes('.ts')) continue;

        const commandName = file.name.slice(0, -3);
        const parents = file.parentPath.split('commands')[1]?.split('/').filter(Boolean).reverse() ?? [];

        commandFiles.push({
            path: `${file.parentPath}/${file.name}`,
            keys: [commandName, ...parents]
        });
    }

    return commandFiles;
}