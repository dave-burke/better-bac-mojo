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
		gender: "m",
		height: 68,
		weight: 180,
		age: 25,
		limit: 0.08,
		units: "imperial",
		calc: "widmark",
		historyMaxDays: 7,
		historyMaxLength: 30,
		alarms:true,
		customDrinkUrl: "",
		importNew: true,
		importUpdated: true
	};
	
	//Default favorite drinks
	var beer = {
		name: "Beer (generic)",
		abv: 5,
		vol: 16,
		units: "oz",
		count: 0,
		lastTime: 0
	}
	var wine = {
		name: "Wine (generic)",
		abv: 12,
		vol: 4,
		units: "oz",
		count: 0,
		updated: 0,
		lastTime: 0
	}
	var shot = {
		name: "Shot (generic)",
		abv: 40,
		vol: 1.5,
		units: "oz",
		count: 0,
		updated: 0,
		lastTime: 0
	}
	var rumAndCola = {
		name: "Rum & Cola",
		abv: 16,
		vol: 5,
		units: "oz",
		count: 0,
		updated: 0,
		lastTime: 0
	}
	var cocktail = {
		name: "Cocktail (generic)",
		abv: 28,
		vol: 3,
		units: "oz",
		count: 0,
		updated: 0,
		lastTime: 0
	}
	this.favDrinks = [beer,wine,shot,rumAndCola,cocktail];
};
