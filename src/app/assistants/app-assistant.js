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
var mainStageName = "main";
var dashboardStage = "dashboard";

function AppAssistant(appController){
	
}

AppAssistant.prototype.setup = function() {
	
}

AppAssistant.prototype.handleLaunch = function (launchParams) {
	//launchParams = {action:"atLimit"};
	if(!launchParams || launchParams.action === undefined){
		var cardStageController = this.controller.getStageController(mainStageName);
		if (cardStageController) {
			Mojo.Log.info("Main Stage exists");
			cardStageController.activate();
		} else {
			Mojo.Log.info("Create Main Stage");
			var pushMainScene = function(stageController) {
				//scenes will be pushed by the stage assistant
			};
			var stageArguments = {
					name: mainStageName,
					assistantName: 'StageAssistant',
					lightweight: false
			};
			this.controller.createStageWithCallback(stageArguments, pushMainScene.bind(this), "card");
		}
	}else{
		this.handleLaunchParams(launchParams);
	}
};

AppAssistant.prototype.handleLaunchParams = function(launchParams) {
	Mojo.Log.info("handleLaunchParams called: %s", launchParams.action);
	this.dbUtils = new DbUtils();
	this.dbUtils.loadDb(function(){
		this.dbUtils.getPrefs(function(value){
			this.prefs = value;
			Mojo.Log.info("Successfully loaded prefs: %j",this.prefs);
			if(this.prefs && this.prefs.alarms){
				switch (launchParams.action) {
					case "atLimit":
						var message = "Your BAC is at " + this.prefs.limit;
						Mojo.Controller.getAppController().playSoundNotification("notifications");
						Mojo.Controller.getAppController().showBanner(message, {source: 'notification'});
						break;
					case "atZero":
						var message = "Your BAC is at zero";
						Mojo.Controller.getAppController().playSoundNotification("notifications");
						Mojo.Controller.getAppController().showBanner(message,
								 {source: 'notification'});
						break;
				}
				this.launchDashboard(message);
			}else{
				Mojo.Log.info("No prefs or alarms off");
			}
		}.bind(this));
	}.bind(this));
};

AppAssistant.prototype.launchDashboard = function(message){
	var appController = Mojo.Controller.appController;
	var cardVisible = appController.getStageProxy(mainStageName) &&
			appController.getStageProxy(mainStageName).isActiveAndHasScenes();
	if (!cardVisible) {
		var stageProxy = appController.getStageProxy(dashboardStage);
		if (stageProxy) {
			stageProxy.delegateToSceneAssistant("setMessage", message);
		} else {
			var pushDashboard = function(stageController) {
				stageController.pushScene("dashboard", message);
			};
			var stageArguments = {
					name: dashboardStage,
					lightweight: false
			};
			appController.createStageWithCallback(stageArguments, pushDashboard.bind(this), "dashboard");
		}
	}
};
