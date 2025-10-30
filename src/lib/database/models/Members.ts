import { sql } from "bun";
import { BaseModel } from "@lib/database";
import type { Exists, Member, MemberInsert } from "@lib/types";
import type { Manager } from "@/Manager";

export class MembersModel extends BaseModel {
    public constructor(manager: Manager) {
        super({
            logContext: 'Members',
            cacheKey: 'members',
            managerInstance: manager
        });
    }

    async get(discordId: string, guildId: string): Promise<Member | null> {
        const cacheKey = this.generateCacheKey(discordId, guildId);
        const cachedData = await this.manager.redis.get(cacheKey);
        if (cachedData) return JSON.parse(cachedData);

        const [member] = await sql<Member[]>`
            SELECT *
            FROM members
            WHERE discord_id = ${discordId} AND guild_id = ${guildId}
        `;

        if (!member) return null;

        await this.manager.redis.set(cacheKey, JSON.stringify(member));
        return member;
    }

    async exists(discordId: string, guildId: string): Promise<boolean> {
        if (await this.manager.redis.exists(
            this.generateCacheKey(discordId, guildId)
        )) return true;

        const [result] = await sql<Exists[]>`
            SELECT EXISTS(
                SELECT 1
                FROM members
                WHERE discord_id = ${discordId} AND guild_id = ${guildId}
            )
        `;

        return Boolean(result?.exists);
    }

    async create(discordId: string, guildId: string): Promise<Member | null> {
        try {
            const memberData: MemberInsert = {
                discord_id: discordId,
                guild_id: guildId,
                player_id: null
            };
            const [member] = await sql<Member[]>`
                INSERT INTO members ${sql(memberData)}
                ON CONFLICT (discord_id, guild_id)
                DO UPDATE SET discord_id = EXCLUDED.discord_id
                RETURNING *
            `;

            await this.manager.redis.set(
                this.generateCacheKey(discordId, guildId),
                JSON.stringify(member)
            );

            return member!;
        } catch (error) {
            this.logger.error(error, 'Failed to create row');
            return null;
        }
    }


    /** inserts if the row doesn't exist */
    async forceGet(discordId: string, guildId: string): Promise<Member> {
        const existing = await this.get(discordId, guildId);
        if (existing) return existing;

        const member = await this.create(discordId, guildId);
        return member!;
    }
}