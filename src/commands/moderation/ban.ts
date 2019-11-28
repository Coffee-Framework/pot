import Command, { CommandContext } from '../../command';
import Logger from '@ayana/logger';
import { error, success } from '../../util/messageUtils';
import ArgUtils from '../../util/argutils';

export default class BanCommand extends Command {
    constructor() {
        super({
            name: 'ban',
            description: 'Bans a user from the server.',
            usage: '<user> [reason...]',
            example: 'LewisTehMinerz bad boy',
            logger: Logger.get(BanCommand)
        });
    }

    public async execute(ctx: CommandContext): Promise<any> {
        if (!ctx.msg.member.permission.has('banMembers'))
            return await ctx.msg.channel.createMessage(error('You do not have enough permissions.'));

        if (ctx.args.length < 1)
            return await ctx.msg.channel.createMessage(error('Not enough arguments. Refer to `coffee help ' + this.info.name + '` for usage.'));

        const argUtils = new ArgUtils(ctx.bot);
        const member = await argUtils.toMember(ctx.args.shift(), ctx);

        if (!member)
            return;

        const reason = (ctx.args.join(' ') || 'No reason specified.');
        
        try {
            await member.ban(7, reason + ' [Punishment issued by ' + ctx.msg.member.username + '#' + ctx.msg.member.discriminator + ']');
        } catch (e) {
            return await ctx.msg.channel.createMessage(error('Failed to ban that user. I might not have enough permissions to do it.'));
        }

        return await ctx.msg.channel.createMessage(success('Banned the user.'));
    }
}