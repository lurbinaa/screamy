import { manager } from "@/Manager";

export default async function () {
    await manager.bot.uploadCommands();
    manager.bot.logger.info('Alive');
}