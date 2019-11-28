import Command, { CommandContext } from '../../command';
import Logger from '@ayana/logger';
import { argsError, standardMessage } from '../../util/messageUtils';

export default class HelpCommand extends Command {
    constructor() {
        super({
            name: 'help',
            description: 'Provides help on commands.',
            usage: '[command]',
            example: 'covfefe',
            logger: Logger.get(HelpCommand)
        });
    }
    
    public async execute(ctx: CommandContext): Promise<any> {
        if (ctx.args.length > 0) {
            const commandWanted = ctx.args[0];

            if (!ctx.cmds[commandWanted])
                return await ctx.msg.channel.createMessage(argsError(ctx.args[0], 'Command does not exist'));

            const command = ctx.cmds[commandWanted];
            return await ctx.msg.channel.createMessage(standardMessage(command.info.description, {
                title: 'Help | ' + command.info.name,
                fields: [
                    {
                        name: 'Usage',
                        value: ctx.prefix + command.info.name + (command.info.usage ? ' ' + command.info.usage : ''),
                        //inline: true
                    },
                    {
                        name: 'Example',
                        value: ctx.prefix + command.info.name + (command.info.example ? ' ' + command.info.example : ''),
                        //inline: true
                    },
                    {
                        name: 'Module',
                        value: command.info.module.name,
                        //inline: true
                    }
                ]
            }));
        }

        const modules: {
            [moduleName: string]: Command[]
        } = {};
        for (const command of Object.values(ctx.cmds)) {
            if (!modules[command.info.module.name]) {
                modules[command.info.module.name] = [];
            }

            modules[command.info.module.name].push(command);
        }

        var description = 
            'Use `coffee help <command>` to get information on a specific command. Arguments can be "quoted like this" and the bot will treat it as one long argument. '
            + 'Not required for commands that have `...` after an argument (in the usage), as it treats it as one long argument anyway.\n\n';
        for (const moduleName of Object.keys(modules)) {
            const moduleCommands = modules[moduleName];

            description += `**${moduleName}**\n`;
            description += moduleCommands.map(c => `\`${c.info.name}\``).join(', ');
            description += '\n\n';
        }

        return await ctx.msg.channel.createMessage(standardMessage(description, {
            title: 'Help'
        }));
    }
}