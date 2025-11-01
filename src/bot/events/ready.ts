import { manager } from "@manager";

export default async function () {
    await manager.bot.uploadCommands();
    manager.bot.logger.info('Alive');
}