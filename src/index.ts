import Eris from 'eris';
import fs from 'fs';
import util from 'util';
import path from 'path';

import Command from './command';

import Logger, { LogLevel } from '@ayana/logger';
import { withIcon, argsError } from './util/messageUtils';

const logger = Logger.get('coffee-main');
Logger.getDefaultTransport().setLevel(LogLevel.TRACE);

const config = JSON.parse(fs.readFileSync('./config.json', 'utf-8'));
const bot = new Eris.Client(config.token);

const commands: {
    [key: string]: Command
} = {};

bot.on('messageCreate', async msg => {
    if (msg.content.startsWith(config.prefix)) {
        const rawData = msg.content.substring(config.prefix.length);
        const split = rawData.split(' ');
        const cmd = split.shift();
        const args = split;

        if (commands[cmd]) {
            const rebuiltArgs: string[] = [];
            var currentQuotedArg = '';
            var startedCurrentQuotedArg = 0;
            var currentArg = 0;

            for (const arg of args) {
                currentArg++;

                if (arg.startsWith('"')) {
                    if (currentQuotedArg !== '') {
                        return await msg.channel.createMessage(
                            argsError(arg,
                                'You cannot start another quoted argument inside of a quoted argument.'));
                    }

                    currentQuotedArg = arg.substring(1);
                    startedCurrentQuotedArg = currentArg;

                    if (arg.endsWith('"')) {
                        currentQuotedArg = arg.substring(1, arg.length - 1);

                        rebuiltArgs.push(currentQuotedArg);
                        currentQuotedArg = '';
                        startedCurrentQuotedArg = 0;
                    }

                    continue;
                }

                if (arg.endsWith('"')) {
                    if (currentQuotedArg !== '') {
                        currentQuotedArg += ' ' + arg.substring(0, arg.length - 1);

                        rebuiltArgs.push(currentQuotedArg);
                        currentQuotedArg = '';
                        startedCurrentQuotedArg = 0;
                        continue;
                    }
                }

                if (currentQuotedArg !== '') {
                    if (currentArg === args.length) {
                        return await msg.channel.createMessage(
                            argsError(arg,
                                'Unbalanced quote starting at argument ' + startedCurrentQuotedArg + '. Check your arguments and try again.'));
                    }
                    currentQuotedArg += ' ' + arg;
                    continue;
                }

                rebuiltArgs.push(arg);
            }

            logger.trace(cmd + ' [' + args.join(',') + ']');

            await commands[cmd].execute({
                bot,
                args: rebuiltArgs,
                msg,
                cmds: commands,
                prefix: config.prefix
            });
        }
    }
});

bot.on('ready', async () => {
    logger.trace(util.inspect(commands, false, 2, true));
    logger.debug('Bot online');

    bot.editStatus('online', {
        type: 3,
        name: 'the coffeepot | ' + config.prefix + 'help'
    });
});

logger.trace('loading commands');

for (const mod of fs.readdirSync(path.join(__dirname, 'commands'))) {
    const moduleData = JSON.parse(fs.readFileSync(path.join(__dirname, 'commands', mod, 'module.json'), 'utf-8'));
    logger.trace('loading module ' + moduleData.name);

    for (const cmds of fs.readdirSync(path.join(__dirname, 'commands', mod))) {
        if (!cmds.endsWith('.js')) continue; // obv when compiled its .js

        const cmdTmp = require(path.join(__dirname, 'commands', mod, cmds)).default;
        const cmd = new cmdTmp();

        cmd.info.module = moduleData;

        commands[cmd.info.name] = cmd;
        logger.trace(cmd.info.name);
    }
}

logger.debug('Logging in');
bot.connect();