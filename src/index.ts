import i18next from "i18next";
import Backend from "i18next-fs-backend";
import { manager } from "./Manager";
import { PRODUCTION } from "@lib/constants";

await i18next
    .use(Backend)
    .init({
        backend: {
            loadPath: "locales/{{lng}}.json",
        },
        fallbackLng: "en",
        preload: ["en", "es"],
        supportedLngs: ["en", "es"],
        interpolation: {
            escapeValue: false,
        },
        debug: !PRODUCTION,
    });

await manager.init({
    redis: {
        connectionTimeout: 5000,
        maxRetries: 5
    }
});