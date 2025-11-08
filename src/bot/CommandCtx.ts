import {
    Constants,
    type Message,
    type CommandInteraction,
    type InteractionContent,
    type CommandInteractionData,
    type InteractionDataOptions,
    type TextableChannel,
} from "eris";
import i18next from "i18next";
import type {
    CtxReplyContent,
    CtxSilentReplyContent,
    CtxTOptions,
    CtxReplyFile
} from "@lib/types";

const { EPHEMERAL } = Constants.MessageFlags

export class CommandCtx {
    public constructor(public interaction: CommandInteraction, public locale: string | null) { };

    public get data(): CommandInteractionData {
        return this.interaction.data;
    }

    public get channel(): TextableChannel {
        return this.interaction.channel
    }

    public get options(): InteractionDataOptions[] | undefined {
        return this.data.options;
    }

    public async reply(content: CtxReplyContent, tOptions?: CtxTOptions, file?: CtxReplyFile): Promise<void> {
        const _content = this.getContent(content, false, tOptions);
        return this.interaction.createMessage(_content, file);
    }

    public async silentReply(content: CtxSilentReplyContent, tOptions?: CtxTOptions, file?: CtxReplyFile): Promise<void> {
        const _content = this.getContent(content, true, tOptions);
        return this.interaction.createMessage(_content, file);
    }

    public async defer(silent?: boolean): Promise<void> {
        const flags = silent ? EPHEMERAL : undefined;
        return this.interaction.defer(flags);
    }

    public async followUp(content: CtxSilentReplyContent, tOptions?: CtxTOptions, file?: CtxReplyFile): Promise<Message> {
        const _content = this.getContent(content, null, tOptions);
        return this.interaction.createFollowup(_content, file);
    }

    private getContent(
        content: CtxReplyContent,
        silent: null,
        tOptions?: CtxTOptions,
    ): InteractionContent
    private getContent(
        content: CtxReplyContent,
        silent: false,
        tOptions?: CtxTOptions,
    ): InteractionContent
    private getContent(
        content: CtxSilentReplyContent,
        silent: true,
        tOptions?: CtxTOptions,
    ): InteractionContent
    private getContent(
        content: CtxSilentReplyContent | CtxReplyContent,
        silent: boolean | null,
        tOptions?: CtxTOptions,
    ): InteractionContent {
        const contentIsString = typeof content === 'string';
        const key = contentIsString ? content : content.content ?? 'bot.errors.no_content';
        const tContent = i18next.t(key, { lng: this.locale ?? undefined, ...tOptions });
        return contentIsString ? {
            content: tContent,
            flags: silent ? EPHEMERAL : undefined
        } : {
            content: tContent,
            flags: silent ? EPHEMERAL : undefined,
            ...content
        };
    }
}