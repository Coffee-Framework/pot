import Eris from 'eris';
import { CommandContext } from '../command';
import { withIcon, error, standardMessage } from './messageUtils';

export default class ArgUtils {
    private client: Eris.Client;

    private channelMentionRegex = /(?:<#)?(?<snowflake>\d+)>?/;
    private userMentionRegex = /(?:<@!?)?(?<snowflake>\d+)>?/;

    constructor(client: Eris.Client) {
        this.client = client;
    }

    private async selector<T>(items: T[], namePredicate: (item: T) => string, ctx: CommandContext, nameOfType: string = 'unknown'): Promise<T> {
        async function getReplyFromUser(client: Eris.Client) {
            function getNextMessage(client: Eris.Client): Promise<Eris.Message> {
                return new Promise(res => {
                    client.once('messageCreate', res);
                });
            }

            while (true) {
                const message = await getNextMessage(client);
                if (message.author.id === ctx.msg.author.id)
                    return message.content;
            }
        }

        const selectorItems: SelectorItem<T>[] = [];

        for (const item of items) {
            selectorItems.push({
                item,
                name: namePredicate(item)
            });
        }

        const selector = await ctx.msg.channel.createMessage(
            standardMessage('Your ' + nameOfType + ' query matches two or more items. Please select from one below (up to 5 listed).\n'
                + '```' + selectorItems.map((i: SelectorItem<T>, idx: number) => ++idx + '. ' + i.name).join('\n') + '\nType c to cancel.```'));

        const response = await getReplyFromUser(this.client);

        if (response === 'c') {
            await selector.edit(error('Cancelled.'));
            return null;
        } else {
            const idx = parseInt(response);
            if (isNaN(idx)) {
                await selector.edit(error('Invalid item. Cancelled.'));
                return null;
            } else {
                const item = selectorItems[idx - 1];

                if (!item) {
                    await selector.edit(error('Invalid item. Cancelled.'));
                    return null;
                } else {
                    await selector.delete('cleaning up selector');
                    return item.item;
                }
            }
        }
    }

    public async toMember(argument: string, ctx: CommandContext): Promise<Eris.Member> {
        const { groups: { snowflake } } = argument.match(this.userMentionRegex) || { groups: { snowflake: null } };

        if (snowflake) {
            const member = ctx.msg.member.guild.members.find(m => m.id === snowflake);
            if (member)
                return member;
        }

        const members = ctx.msg.member.guild.members.filter(m => m.username.toLowerCase().startsWith(argument.toLowerCase())).slice(0, 5);

        if (members.length < 1) {
            await ctx.msg.channel.createMessage(withIcon('<:cross:602260273071652884>', 'Could not find any members.'));
            return null;
        } else if (members.length === 1) {
            return members[0];
        }

        return this.selector<Eris.Member>(members, (m) => m.username, ctx, 'member');
    }

    public async toChannel(argument: string, ctx: CommandContext): Promise<Eris.Channel[]> {
        const { groups: { snowflake } } = argument.match(this.channelMentionRegex) || { groups: { snowflake: null } };

        // if it's a snowflake or a channel mention
        if (snowflake) {
            const channel = ctx.msg.member.guild.channels.find(c => c.id === snowflake);
            if (channel)
                return [channel];
        }

        // if it's a name
        return ctx.msg.member.guild.channels.filter(c => c.name.startsWith(argument)).slice(0, 5);
    }

    public async toTextChannel(argument: string, ctx: CommandContext): Promise<Eris.TextChannel> {
        const channels = await this.toChannel(argument, ctx);
        const textChannels = channels.filter(c => c instanceof Eris.TextChannel) as Eris.TextChannel[];

        if (textChannels.length < 1) {
            //await ctx.msg.channel.createMessage(withIcon('<:cross:602260273071652884>', 'Could not find any channels.'));
            return null;
        } else if (textChannels.length === 1) {
            return textChannels[0];
        }

        return this.selector<Eris.TextChannel>(textChannels, (c) => '#' + c.name, ctx, 'text channel');
    }
}

type SelectorItem<T> = {
    item: T,
    name: string
};