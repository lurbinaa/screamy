import { sql } from "bun";
import { BaseModel } from "@lib/database";
import { NULL_MARKER } from "@lib/constants";
import type { Guild, Exists, GuildInsert } from "@lib/types";
import type { Manager } from "@manager";

export class GuildModel extends BaseModel {
    public constructor(manager: Manager) {
        super({
            logContext: 'Guilds',
            cacheKey: 'guild',
            managerInstance: manager
        });
    }

    public async get(guildId: string): Promise<Guild | null> {
        const cacheKey = this.generateCacheKey(guildId);
        const cachedData = await this.manager.redis.get(cacheKey);
        if (cachedData) return JSON.parse(cachedData);

        const [guild] = await sql<Guild[]>`
            SELECT * FROM guilds
            WHERE discord_id = ${guildId}`;

        if (!guild) return null;

        await this.manager.redis.set(cacheKey, JSON.stringify(guild));
        return guild;
    }

    public async getLocale(guildId: string): Promise<string | null> {
        const cacheKey = this.generateCacheKey(guildId, 'locale');
        const cachedData = await this.manager.redis.get(cacheKey);
        if (cachedData) return cachedData !== NULL_MARKER ? cachedData : null;

        const [row] = await sql<{ locale: string | null }[]>`
            SELECT locale FROM guilds
            WHERE discord_id = ${guildId}`;

        const locale = row?.locale ?? null;
        await this.manager.redis.set(cacheKey, locale ?? '__NULL__');
        return locale;
    }

    async insert(guildId: string, locale?: string): Promise<Guild | null> {
        try {
            const memberData: GuildInsert = {
                discord_id: guildId,
                locale: locale ?? null
            };

            const [member] = await sql<Guild[]>`
                INSERT INTO guilds ${sql(memberData)}
                RETURNING *`;

            await this.manager.redis.set(
                this.generateCacheKey(guildId),
                JSON.stringify(member)
            );

            return member!;
        } catch (error) {
            this.logger.error(error, 'Failed to create row');
            return null;
        }
    }

    /** inserts if the row doesn't exist */
    async forceGet(guildId: string): Promise<Guild> {
        const existing = await this.get(guildId);
        if (existing) return existing;

        const member = await this.insert(guildId);
        return member!;
    }

    async exists(discordId: string, guildId: string): Promise<boolean> {
        if (await this.manager.redis.exists(
            this.generateCacheKey(discordId, guildId)
        )) return true;

        const [result] = await sql<Exists[]>`
                SELECT EXISTS(
                    SELECT 1 FROM members
                    WHERE discord_id = ${discordId} AND guild_id = ${guildId}
                )`;

        return Boolean(result?.exists);
    }
}