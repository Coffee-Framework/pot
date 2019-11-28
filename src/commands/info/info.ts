import Command, { CommandContext } from '../../command';
import Logger from '@ayana/logger';
import { standardMessage } from '../../util/messageUtils';

export default class InfoCommand extends Command {

    constructor() {
        super({
            name: 'info',
            description: 'Provides information about the bot.',
            usage: null,
            example: null,
            logger: Logger.get(InfoCommand)
        });
    }

    public async execute(ctx: CommandContext): Promise<any> {
        return await ctx.msg.channel.createMessage(
            standardMessage(
                'Coffee is an open source bot (framework) written by LewisTehMinerz. Whilst built originally to be a private bot, it was eventually extended '
                + 'into a full fledged framework for botmaking and was released to the public.\n\n[Repository](https://gitlab.com/coffee)', {
            title: 'Coffee Info',
            fields: [
                {
                    name: 'Memory Usage',
                    value: (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(0) + 'MB',
                    inline: true
                },
                {
                    name: 'Cached Users',
                    value: ctx.bot.users.size.toString(),
                    inline: true
                },
                {
                    name: 'Guilds',
                    value: ctx.bot.guilds.size.toString(),
                    inline: true
                }
            ]
        }));
    }
}