import Eris from 'eris';
import merge from 'lodash.merge';

export function standardMessage(text: string, extra?: Eris.EmbedBase): Eris.MessageContent {
    return {
        embed: merge({
            color: 0x5e360f,
            description: text
        }, extra)
    }
}

export function success(text: string, extra?: Eris.EmbedBase): Eris.MessageContent {
    return standardMessage(text, merge({
        title: '<:check:602260272740302850> Success',
        color: 0x00ff00
    }, extra));
}

export function error(text: string, extra?: Eris.EmbedBase): Eris.MessageContent {
    return standardMessage(text, merge({
        title: '<:cross:602260273071652884> Error',
        color: 0xff0000
    }, extra));
}

export function argsError(erroredArgument: string, err: string): Eris.MessageContent {
    return error('An argument error has occurred.', {
        fields: [
            {
                name: 'Problematic Argument',
                value: erroredArgument,
                inline: true
            },
            {
                name: 'Error Occurred',
                value: err,
                inline: true
            }
        ]
    });
}

export function modlog(userPunished: Eris.Member, moderator: Eris.Member, type: string, reason: string): Eris.MessageContent {
    return standardMessage(null, {
        title: type,
        fields: [
            {
                name: 'Punished',
                value: `${userPunished.username}#${userPunished.discriminator} (${userPunished.id})`,
                inline: true
            },
            {
                name: 'Moderator',
                value: `${moderator.username}#${moderator.discriminator} (${moderator.id})`,
                inline: true
            },
            {
                name: 'Reason',
                value: reason,
                inline: true
            }
        ],
        timestamp: new Date().toString()
    });
}

export function withIcon(icon: string, text: string) { return `${icon}  |  ` + text };