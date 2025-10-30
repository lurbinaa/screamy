import type { BaseModelConfig } from "@lib/types";
import { type Logger, withContext } from "@lib/core/logger";
import type { Manager } from "@/Manager";

export abstract class BaseModel {
    private cacheKey: string;
    protected logger: Logger;
    protected manager: Manager;
    protected constructor(config: BaseModelConfig) {
        this.manager = config.managerInstance;
        this.cacheKey = config.cacheKey;
        this.logger = withContext(`${config.logContext} Database`)
    }

    public generateCacheKey(...ids: string[]) {
        return [this.cacheKey, ...ids].join(':');
    }
}