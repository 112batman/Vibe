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

import Client from './Client';

export default abstract class Event {
	abstract name: string;
	abstract type: any;
	abstract once: boolean = false;

	constructor(protected bot: Client) {}

	abstract run(...args: any[]): Promise<any>;

	public async exec(...args: any[]): Promise<void> {
		await this.run(...args);
	}
}
