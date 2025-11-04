import type { Manager } from "@manager";

export interface BaseModelConfig {
    managerInstance: Manager
    logContext: string;
    cacheKey: string;
}
export interface PingResponse {
    postgres: number;
    redis: number;
}
export interface Team {
    id: number;
    name: string;
    created_at: Date;
    player_ids: number[];
}
export interface Player {
    id: number;
    tag: string;
    name: string;
    tier: string;
    team_id: number | null;
    created_at: Date;
}
export interface Member {
    discord_id: string;
    guild_id: string;
    player_id: number | null;
    created_at: Date;
}
export interface Guild {
    discord_id: string;
    locale: string | null;
    created_at: Date;
}

export type TeamInsert = Omit<Team, 'id' | 'created_at'>;
export type PlayerInsert = Omit<Player, 'id' | 'created_at' | 'team'>;
export type MemberInsert = Omit<Member, 'id' | 'created_at' | 'player'>;
export type GuildInsert = Omit<Guild, 'created_at'>

export type TeamUpdate = Partial<TeamInsert> & { id: number };
export type PlayerUpdate = Partial<PlayerInsert> & { id: number };
export type MembertUpdate = Partial<MemberInsert> & { discord_id: string, guild_id: string };
export type GuildUpdate = Partial<GuildInsert> & { discord_id: string };

export type Exists = { exists: true };