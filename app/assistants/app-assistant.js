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
var mainStage = "main";
var dashboardStage = "dashboard";

function AppAssistant(appController){
	
}

AppAssistant.prototype.handleLaunch = function (launchParams) {
	if(launchParams){
		this.handleLaunchParams(launchParams);
	}else{
		Mojo.Log.info("No launch params");
		var stageProxy = this.controller.getStageProxy(mainStage);
		if (stageProxy) {
			Mojo.Log.info("Got stage proxy");
			var stageController = this.controller.getStageController(mainStage);
			if (stageController) {
				Mojo.Log.info("Got stage controller");
				stageController.window.focus();
			}
		}
	}
};

AppAssistant.prototype.handleLaunchParams = function(launchParams) {
	Mojo.Log.info("handleLaunchParams called: %s", launchParams.action);
	var dashboardOpen = this.controller.getStageController(dashboardStage);
	switch (launchParams.action) {
		case "atLimit":
			Mojo.Controller.getAppController().showBanner("Your BAC is at the limit",
					 {source: 'notification'});
			break;
		case "atZero":
			Mojo.Controller.getAppController().showBanner("Your BAC is at zero",
					 {source: 'notification'});
			break;
	}
};
