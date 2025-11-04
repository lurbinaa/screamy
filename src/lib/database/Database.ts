import { redis, sql } from "bun";
import { readdir } from "node:fs/promises";
import type { PingResponse } from "@lib/types";
import { GuildsModel, MembersModel } from '.';
import { Manager } from '@manager';

export class Database {
    private _members?: MembersModel;
    private _guilds?: GuildsModel
    public constructor(private manager: Manager) {
        this.manager = manager;
    }

    get members(): MembersModel {
        if (!this._members) {
            this._members = new MembersModel(this.manager);
        }

        return this._members;
    }

    get guilds(): GuildsModel {
        if (!this._guilds) {
            this._guilds = new GuildsModel(this.manager);
        }

        return this._guilds;
    }

    public async ping(): Promise<PingResponse> {
        const p = () => performance.now();

        const pgStart = p();
        await sql`SELECT 1`;
        const pgEnd = p();

        const rStart = p();
        await redis.ping();
        const rEnd = p();

        return {
            postgres: pgEnd - pgStart,
            redis: rEnd - rStart
        }
    }

    public async migrate(): Promise<void> {
        const path = 'migrations';
        const files = await readdir(path);

        for (const file of files) {
            if (!file.endsWith('.sql')) continue;
            const query = await Bun.file(`${path}/${file}`).text();
            await sql.unsafe(query);
        }
    }
}