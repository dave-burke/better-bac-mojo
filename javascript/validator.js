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
}

Validator.prototype.validatePrefs = function(prefs){
	if(isNaN(prefs.height)){
		Mojo.Controller.errorDialog("Height must be a number");
		prefs.height = 68;
	}
	if(prefs.height < 1.0){
		prefs.height = 1.0;
	}
	if(prefs.height > 120){
		prefs.height = 120;
	}
	
	if(isNaN(prefs.weight)){
		Mojo.Controller.errorDialog("Weight must be a number");
		prefs.weight = 180;
	}
	if(prefs.weight < 1.0){
		prefs.weight = 1.0;
	}
	if(prefs.weight > 1000){
		prefs.weight = 1000;
	}
	if(prefs.age < 0){
		prefs.age = 0;
	}
	if(prefs.age > 120){
		prefs.age = 120;
	}
	
	if(isNaN(prefs.limit)){
		Mojo.Controller.errorDialog("Limit must be a number");
		prefs.limit = 0.08;
	}
	if(prefs.limit < 0){
		prefs.limit = 0;
	}
	if(prefs.limit > 1){
		prefs.limit = 1;
	}
}