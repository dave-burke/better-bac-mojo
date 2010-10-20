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
function MojoUtils(caller) {
	this.caller = caller;
}

MojoUtils.prototype.simpleMessage = function(message){
	this.caller.controller.showAlertDialog({
		onChoose: function(choice){},
		message: message,
		choices: [{label: "Okay", value: true, type: "dismiss"}]
	});
};

MojoUtils.prototype.isFirstTime = function(key){
	var cookie = new Mojo.Model.Cookie(Mojo.appInfo.id + '.firstTimes');
	var firstTimes = cookie.get();
	if (!firstTimes) {
		firstTimes = {};
	}
	if(firstTimes[key]){
		//All this has happened before
		return false;
	}else{
		//All this won't happen again
		firstTimes[key] = true;
		cookie.put(firstTimes);
		return true;
	}
};