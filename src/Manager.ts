import { RedisClient } from "bun";
import { Bot } from "@bot";
import { Database } from "@lib/database";
import { requiresInitGetter, InitializableClass } from "@lib/decorators";
import { isProduction } from "./lib/core";
import type { ManagerInitOptions } from "@lib/types";

export class Manager extends InitializableClass {
    /*      instances */
    private _bot?: Bot;
    private _database?: Database;
    private _redis?: RedisClient;

    private config?: ManagerInitOptions;
    public async init(config: ManagerInitOptions): Promise<void> {
        this.config = config;

        await this.bot.init();
        this._initialized = true;

        if (isProduction) await this.database.migrate();
    }

    @requiresInitGetter
    public get bot(): Bot {
        if (!this._bot) {
            this._bot = new Bot();
        }

        return this._bot;
    }

    @requiresInitGetter
    public get database(): Database {
        if (!this._database) {
            this._database = new Database(this);
        }

        return this._database;
    }

    @requiresInitGetter
    public get redis(): RedisClient {
        if (!this._redis) {
            this._redis = new RedisClient(undefined, this.config?.redis);
        }

        return this._redis;
    }
}

export const manager = new Manager();