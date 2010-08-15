/*
 * This file is part of Better BAC
 * Copyright (C) 2010 David Burke
 *
 * Better BAC is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Better BAC is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
function Defaults() {
	//Default state
	this.state = {
		bac: 0.0,
		lastUpdate: new Date().getTime(),
		drinks: []
	};
	
	//Default prefs
	this.prefs = {
		"gender": "m",
		"height": 68,
		"weight": 180,
		"age": 25,
		"limit": 0.08,
		"calc": "widmark",
		"historyMaxDays": 7,
		"historyMaxLength": 30,
		"alarms":true
	};
	
	//Default favorite drinks
	var beer = {
		name: "Beer",
		abv: 5,
		vol: 16,
		count: 0,
		lastTime: new Date()
	}
	var wine = {
		name: "Wine",
		abv: 12,
		vol: 4,
		count: 0,
		lastTime: new Date()
	}
	var shot = {
		name: "Shot",
		abv: 35,
		vol: 1.5,
		count: 0,
		lastTime: new Date()
	}
	var cocktail = {
		name: "Cocktail",
		abv: 20,
		vol: 5,
		count: 0,
		lastTime: new Date()
	}
	this.favDrinks = [beer,wine,shot,cocktail];
}