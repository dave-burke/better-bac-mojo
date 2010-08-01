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
	this.clearAlarm(time,this.atLimitKey);
}

TimeoutUtils.prototype.setAtZero = function(time){
	this.setAlarmIn(time,this.atZeroKey);
}

TimeoutUtils.prototype.clearAtZero = function(){
	this.clearAlarm(time,this.atZeroKey);
}

TimeoutUtils.prototype.setAlarmIn = function(time, key){
	this.setAlarm(time, key, "in");
}

TimeoutUtils.prototype.setAlarmAt = function(time, key){
	this.setAlarm(time, key, "at");
}

TimeoutUtils.prototype.setAlarm = function(time, key, type){
	var parameters = {};
	parameters.wakeup = true;
	parameters.key = Mojo.appInfo.id + '.' + key;
	//parameters.uri = "palm://com.palm.applicationManager/open";
	parameters.uri = "palm://com.palm.applicationManager/launch";
	parameters.params = {
		"id": Mojo.appInfo.id,
		"params": {"action": key}
	};
	parameters[type] = time;
	this.controller.serviceRequest("palm://com.palm.power/timeout", {
	    method: "set",
	    parameters: parameters,
	    onSuccess: function(response) {
			Mojo.Log.info("Alarm set success: %s", response.returnValue);
		},
		onFailure: function(response) {
			Mojo.Log.info("Alarm set failure: %s:%s", response.returnValue, response.errorText);
		}
	});
}

TimeoutUtils.prototype.clearAlarm = function(key){
	this.schedulerSetRequest = new Mojo.Service.Request(
		    "palm://com.palm.power/timeout",
		    {
		        method: "clear",
		        parameters: {"key": key},
		        onSuccess: function(response) {
					Mojo.Log.info("Alarm clear success: %s", response.returnValue);
				},
				onFailure: function(response) {
					Mojo.Log.info("Alarm clear failure: %s:%s", response.returnValue, response.errorText);
				}
		    }
		);
}
