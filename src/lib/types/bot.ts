import type { CommandCtx } from "@bot";
import type {
    CommandInteraction,
    ApplicationCommandCreateOptions,
    ApplicationCommandOptionsSubCommand,
    ApplicationCommandOptionsSubCommandGroup,
    InteractionContent,
    FileContent
} from "eris";
import type Constants from "eris/lib/Constants";

export enum CommandTypes {
    Main,
    SubCommand,
    SubCommandGroup
}

export type Command<T extends CommandTypes | void = void> =
    T extends CommandTypes.Main ? ApplicationCommandCreateOptions<true, Constants["ApplicationCommandTypes"]["CHAT_INPUT"]> :
    T extends CommandTypes.SubCommand ? ApplicationCommandOptionsSubCommand :
    T extends CommandTypes.SubCommandGroup ? ApplicationCommandOptionsSubCommandGroup :
    ApplicationCommandCreateOptions<true, Constants["ApplicationCommandTypes"]["CHAT_INPUT"]> |
    ApplicationCommandOptionsSubCommand |
    ApplicationCommandOptionsSubCommandGroup;
export type Execute = (context: CommandCtx) => Promise<void>;
export type RawCommand<T extends CommandTypes | void = void> = Omit<Command<T>, 'name'> & {
    execute?: Execute
}
export type CommandCollection = Command<CommandTypes.Main>[];
export type CommandExecutionsCollection = Map<string, Execute>;
export type {
    ApplicationCommandOptionsSubCommand,
    ApplicationCommandOptionsSubCommandGroup
}
export type CtxReplyContent = string | InteractionContent;
export type CtxSilentReplyContent = string | Omit<InteractionContent, 'flags'>;
export type CtxTOptions = { [key: string]: unknown };
export type CtxReplyFile = FileContent | FileContent;

export interface CommandFile {
    path: string;
    keys: string[];
}
export interface GetCommandsOutput {
    commands: CommandCollection;
    executeCollection: CommandExecutionsCollection
}