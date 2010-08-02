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
function TimeoutUtils() {
	this.atLimitKey = "atLimit";
	this.atZeroKey = "atZero";
}

TimeoutUtils.prototype.setAtLimit = function(time){
	this.setAlarmIn(time,this.atLimitKey);
}

TimeoutUtils.prototype.clearAtLimit = function(){
	this.clearAlarm(this.atLimitKey);
}

TimeoutUtils.prototype.setAtZero = function(time){
	this.setAlarmIn(time,this.atZeroKey);
}

TimeoutUtils.prototype.clearAtZero = function(){
	this.clearAlarm(this.atZeroKey);
}

TimeoutUtils.prototype.setAlarmIn = function(time, key){
	this.setAlarm(time, key, "in");
}

TimeoutUtils.prototype.setAlarmAt = function(time, key){
	this.setAlarm(time, key, "at");
}

TimeoutUtils.prototype.setAlarm = function(time, key, type){
	if(time <= 5){
		Mojo.Log.warn("Won't set " + key + " when time is <= 5");
		//TODO actually lauch app with params based on alarm key
		Mojo.Controller.getAppController().showBanner("Skipping " + key + " alarm",
				 {source: 'notification'});
		this.clearAlarm(key);
	}else{
		var hours =	Math.floor(time / 60);
		var minutes = time % 60;
		var timeFormatted = hours + ":" + minutes + ":00";
		
		var parameters = {};
		parameters.wakeup = true;
		parameters.key = Mojo.appInfo.id + '.' + key;
		//parameters.uri = "palm://com.palm.applicationManager/open";
		parameters.uri = "palm://com.palm.applicationManager/launch";
		parameters.params = {
			"id": Mojo.appInfo.id,
			"params": {"action": key}
		};
		parameters[type] = timeFormatted;
		this.schedulerClearRequest = new Mojo.Service.Request(
			"palm://com.palm.power/timeout",
			{
				method: "set",
				parameters: parameters,
				onSuccess: function(response) {
					Mojo.Log.warn("Set " + key + " for " + time);
				}.bind(this),
				onFailure: function(response) {
					Mojo.Log.warn("Failed to set " + key + " for " + time + ": %s", response.errorText);
				}.bind(this)
			}
		);
	}
}

TimeoutUtils.prototype.clearAlarm = function(key){
	this.schedulerSetRequest = new Mojo.Service.Request(
		    "palm://com.palm.power/timeout",
		    {
			method: "clear",
			parameters: {"key": Mojo.appInfo.id + "." + key},
			onSuccess: function(response) {
					Mojo.Log.warn(key + " alarm clear success"); }.bind(this),
				onFailure: function(response) {
					Mojo.Log.warn(key + " alarm clear failure: %s", response.errorText);
				}.bind(this)
		    }
		);
}
