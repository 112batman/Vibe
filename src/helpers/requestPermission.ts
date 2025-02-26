/*
    Copyright (C) 2021 Tijn Hoftijzer

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.
    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.
    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

import {
	GuildMember,
	MessageReaction,
	TextChannel,
	User,
} from 'discord.js-light';
import Client from '../classes/Client';
import { getNotification } from './embed';

export enum DJPermission {
	dj,
	vote,
	alone,
	any,
}

export enum PermissionReason {
	none,
	notConnected,
	isDj,
	isAlone,
	vote,
	connected,
}

export function requestPermission(
	bot: Client,
	channel: TextChannel,
	user: GuildMember,
	permissions: DJPermission[]
): Promise<{
	perm: boolean;
	reason: PermissionReason;
}> {
	return new Promise(async (res) => {
		if (permissions.length < 1)
			return res({
				perm: true,
				reason: PermissionReason.none,
			});

		const player = await bot.guildManager.getPlayer(channel.guild);
		const isConnected = player.connected;

		if (permissions.includes(DJPermission.any) && isConnected)
			return res({
				perm: true,
				reason: PermissionReason.connected,
			});

		const roleIds: string[] = (<any>await user.fetch())._roles;
		let isDj = false;
		for (let i = 0; i < roleIds.length; i++) {
			const role = await user.guild.roles.fetch(roleIds[i]);
			if (role.name.toLowerCase() === 'dj') {
				isDj = true;
				break;
			} else continue;
		}
		if (permissions.includes(DJPermission.dj) && isDj)
			return res({
				perm: true,
				reason: PermissionReason.isDj,
			});

		if (!isConnected)
			return res({
				perm: false,
				reason: PermissionReason.notConnected,
			});

		if (permissions.includes(DJPermission.alone)) {
			if (player.connected) {
				if (player.channel.members.size < 3) {
					return res({
						perm: true,
						reason: PermissionReason.isAlone,
					});
				}
			}
		}

		if (permissions.includes(DJPermission.vote) && isConnected) {
			const msg = await channel.send(
				getNotification('Give vote permissions?', user.user)
			);
			await msg.react('✅');
			await msg.react('❌');

			const collector = msg.createReactionCollector(
				(reaction: MessageReaction, user: User) => {
					return (
						user.id !== bot.user.id &&
						(reaction.emoji.name === '✅' || reaction.emoji.name === '❌') &&
						player.channel.members.array().filter((m) => m.id === user.id)
							.length > 0
					);
				},
				{
					time: 20 * 1000,
				}
			);
			const requiredYes = Math.round(
				((player.channel.members.size - 1) / 3) * 2
			);
			let yes = 0;

			collector.on('collect', (reaction) => {
				if (reaction.emoji.name === '✅') yes++;

				if (yes >= requiredYes) {
					collector.stop('-1');

					return res({
						perm: true,
						reason: PermissionReason.vote,
					});
				}
			});

			collector.on('end', (collected, reason) => {
				if (reason !== '-1')
					return res({
						perm: false,
						reason: PermissionReason.none,
					});
			});
		} else
			return res({
				perm: false,
				reason: PermissionReason.none,
			});
	});
}

export function getMessage(
	perm: boolean,
	reason: PermissionReason,
	author: User
) {
	if (reason === PermissionReason.notConnected) {
		return getNotification('You are not connected to my voice channel', author);
	} else if (reason === PermissionReason.none) {
		return getNotification(
			perm ? 'You are allowed to do this' : 'You are not allowed to do this',
			author
		);
	}
}
