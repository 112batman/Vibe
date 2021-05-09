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

import Command from '../classes/Command';
import { Message } from 'discord.js-light';
import PermissionType from '../ts/PermissionType';
import { getNotification, getSongEmbed } from '../helpers/embed';

export default class extends Command {
	public name = 'nowplaying';
	public alias = ['np'];
	public permissions: PermissionType[] = [];

	public async exec(message: Message, args: string[], label: string) {
		const player = await this.bot.guildManager.getPlayer(message.guild);
		if (player.queue.current) {
			message.channel.send(
				getSongEmbed(player.queue.current, message.author, 'Now playing')
			);
		} else {
			message.channel.send(
				getNotification('Not currently playing anything', message.author)
			);
		}
	}
}
