import {
    Constants,
    type CommandInteraction,
} from "eris";
import i18next from "i18next";
import type {
    CtxReplyContent,
    CtxSilentReplyContent,
    CtxTOptions,
    CtxReplyFile
} from "@lib/types";

export class CommandCtx {
    public constructor(public interaction: CommandInteraction, public locale: string | null) { };

    public async reply(content: CtxReplyContent, tOptions?: CtxTOptions, file?: CtxReplyFile) {
        const contentIsString = typeof content === 'string';
        const key = contentIsString ? content : content.content ?? 'bot.errors.no_content';
        const tContent = i18next.t(key, { lng: this.locale ?? undefined, ...tOptions });
        const _content = contentIsString ? tContent : { content: tContent, ...content };

        return this.interaction.createMessage(_content, file);
    }

    public async silentReply(content: CtxSilentReplyContent, tOptions?: CtxTOptions, file?: CtxReplyFile) {
        const contentIsString = typeof content === 'string';
        const key = contentIsString ? content : content.content ?? 'bot.errors.no_content';
        const tContent = i18next.t(key, { lng: this.locale ?? undefined, ...tOptions });
        const _content = contentIsString ? {
            content: tContent,
            flags: Constants.MessageFlags.EPHEMERAL
        } : {
            content: tContent,
            flags: Constants.MessageFlags.EPHEMERAL,
            ...content
        };

        return this.interaction.createMessage(_content, file);
    }
}