import { sql } from "bun";
import { readdir } from "node:fs/promises";
import { Manager } from '@manager';
import { MembersModel } from './models';

export class Database {
    private _members?: MembersModel;
    public constructor(private manager: Manager) {
        this.manager = manager;
    }

    get Members() {
        if (!this._members) {
            this._members = new MembersModel(this.manager);
        }

        return this._members;
    }

    public async migrate() {
        const files = await readdir('migrations');

        for (const file of files) {
            if (!file.endsWith('.sql')) continue;
            const query = await Bun.file(file).text();
            await sql`${query}`;
        }
    }
}