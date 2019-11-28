import Eris = require('eris');
import Logger from '@ayana/logger';

export default abstract class Command {
    public info: CommandInfo;

    constructor(info: CommandInfo) {
        this.info = info;
    }

    public abstract execute(ctx: CommandContext): Promise<any>;
}

interface CommandInfo {
    name: string,
    description: string,
    usage: string,
    example: string,
    logger: Logger,
    module?: ModuleInfo
}

interface ModuleInfo {
    name: string
}

export interface CommandContext {
    bot: Eris.Client,
    msg: Eris.Message,
    args: string[],
    cmds: {
        [key: string]: Command
    },
    prefix: string
}