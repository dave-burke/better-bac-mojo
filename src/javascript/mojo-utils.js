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

MojoUtils.prototype.simpleEmail = function(subject, message, recipientEmail, recipientName){
	recipientName = recipientName ? recipientName : recipientEmail;
	var recipients = [];
	if(recipientEmail && recipientEmail.length > 0){
		recipients.push({type: 'email',
	        role: 1,
	        value: recipientEmail,
	        contactDisplay: recipientName});
	}
	Mojo.Log.info("Sending message: " + message);
	var obj = new Mojo.Service.Request("palm://com.palm.applicationManager/", {
		method: "open",
		parameters: {
			id: "com.palm.app.email",
			params: {
				"summary": subject,
				"text": message,
				"recipients": recipients
			}
		}
	});
}

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

//From WebOS101 Snippets: http://webos101.com/Code_Snippets#Checking_data_connectivity
MojoUtils.prototype.checkConnectivity = function (callbackConnected, callbackNotConnected) {
	this.caller.controller.serviceRequest('palm://com.palm.connectionmanager', {
		method: 'getstatus',
		parameters: {},
		onSuccess: function (response) {
			var wifi = response.wifi;
			var wan = response.wan;
			var hasInternet = response.isInternetConnectionAvailable;
 
			if(hasInternet && wifi.state === "connected"){
				Mojo.Log.info("Wifi internet connection detected");
				callbackConnected();
			}else if (hasInternet && wan.state === "connected") {
				Mojo.Log.info("Wan internet connection detected");
				callbackConnected();
			} else {
				if(callbackNotConnected){
					callbackNotConnected();
				}else{
					this.simpleMessage($L("You do not have an Internet connection."));
				}
			}
		},
		onFailure: function(response) {
			Mojo.Log.info("Could not determine internet connection status. errorCode=%s, errorText=%s",response.errorCode,response.errorText);
			this.simpleMessage($L("Could not determine internet connection status: ") + response.errorText);
		}
	});
}