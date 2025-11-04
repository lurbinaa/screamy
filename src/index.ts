import { manager } from "./Manager";

await manager.init({
    redis: {
        connectionTimeout: 5000,
        maxRetries: 5
    }
});

await manager.database.migrate();