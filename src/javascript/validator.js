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
function Validator() {
	this.defaults = new Defaults();
}

Validator.prototype.validatePrefs = function(prefs){
	var heightMin = 1.0;
	var heightMax = 300.0;
	var weightMin = 1.0;
	var weightMax = 1000.0;
	var ageMin = 1;
	var ageMax = 120;
	
	if(isNaN(prefs.height)){
		Mojo.Controller.errorDialog("Height must be a number");
		prefs.height = this.defaults.prefs.height;
	}
	if(prefs.height < heightMin){
		prefs.height = heightMin;
	}
	if(prefs.height > heightMax){
		prefs.height = heightMax;
	}
	
	if(isNaN(prefs.weight)){
		Mojo.Controller.errorDialog("Weight must be a number");
		prefs.weight = this.defaults.prefs.weight;
	}
	if(prefs.weight < weightMin){
		prefs.weight = weightMin;
	}
	if(prefs.weight > weightMax){
		prefs.weight = weightMax;
	}
	if(prefs.age < ageMin){
		prefs.age = ageMin;
	}
	if(prefs.age > ageMax){
		prefs.age = ageMax;
	}
	
	if(isNaN(prefs.limit)){
		Mojo.Controller.errorDialog("Limit must be a number");
		prefs.limit = this.defaults.prefs.limit;
	}
	if(prefs.limit < 0){
		prefs.limit = 0.0;
	}
	if(prefs.limit > 1){
		prefs.limit = 1.0;
	}
}