import Command, { CommandContext } from '../../command';
import Logger from '@ayana/logger';

import fs from 'fs';

export default class CovfefeCommand extends Command {
    private covfefe: Buffer = fs.readFileSync('./covfefe.jpg');

    constructor() {
        super({
            name: 'covfefe',
            description: 'covfefe.',
            usage: null,
            example: null,
            logger: Logger.get(CovfefeCommand)
        });
    }

    public async execute(ctx: CommandContext): Promise<any> {
        this.info.logger.trace('covfefe');
        
        return await ctx.msg.channel.createMessage('', { file: this.covfefe, name: 'covfefe.jpg' });
    }
}