import Command, { CommandContext } from '../../command';
import Logger from '@ayana/logger';
import { error, success } from '../../util/messageUtils';
import ArgUtils from '../../util/argutils';

export default class KickCommand extends Command {
    constructor() {
        super({
            name: 'kick',
            description: 'Kicks a user from the server.',
            usage: '<user> [reason...]',
            example: 'LewisTehMinerz bad boy',
            logger: Logger.get(KickCommand)
        });
    }

    public async execute(ctx: CommandContext): Promise<any> {
        if (!ctx.msg.member.permission.has('kickMembers'))
            return await ctx.msg.channel.createMessage(error('You do not have enough permissions.'));

        if (ctx.args.length < 1)
            return await ctx.msg.channel.createMessage(error('Not enough arguments. Refer to `coffee help ' + this.info.name + '` for usage.'));

        const argUtils = new ArgUtils(ctx.bot);
        const member = await argUtils.toMember(ctx.args.shift(), ctx);

        if (!member)
            return;

        const reason = (ctx.args.join(' ') || 'No reason specified.');
        
        try {
            await member.kick(reason + ' [Punishment issued by ' + ctx.msg.member.username + '#' + ctx.msg.member.discriminator + ']');
        } catch (e) {
            return await ctx.msg.channel.createMessage(error('Failed to kick that user. I might not have enough permissions to do it.'));
        }

        return await ctx.msg.channel.createMessage(success('Kicked the user.'));
    }
}