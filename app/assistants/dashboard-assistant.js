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
function DashboardAssistant(message) {
	this.message = message;
}

DashboardAssistant.prototype.setup = function() {
	this.updateDisplay();
	this.tapHandler = this.launchMain.bindAsEventListener(this);
	this.controller.listen("dashboardinfo", Mojo.Event.tap, this.tapHandler);

	this.stageDocument = this.controller.stageController.document;

	this.activateStageHandler = this.activateStage.bindAsEventListener(this);
	Mojo.Event.listen(this.stageDocument, Mojo.Event.stageActivate, this.activateStageHandler);

	this.deactivateStageHandler = this.deactivateStage.bindAsEventListener(this);
	Mojo.Event.listen(this.stageDocument, Mojo.Event.stageDeactivate, this.deactivateStageHandler);
};

DashboardAssistant.prototype.setMessage = function(message){
	this.message = message;
	this.updateDisplay();
};

DashboardAssistant.prototype.updateDisplay = function() {
	var info = {message: this.message};
	var renderedInfo = Mojo.View.render({object: info, template: "dashboard/single-item-info"});
	var infoElement = this.controller.get("dashboardinfo");
	infoElement.innerHTML = renderedInfo;
};

DashboardAssistant.prototype.cleanup = function() {
	this.controller.stopListening("dashboardinfo", Mojo.Event.tap, this.tapHandler);
	Mojo.Event.stopListening(this.stageDocument, Mojo.Event.stageActivate, this.activateStageHandler);
	Mojo.Event.stopListening(this.stageDocument, Mojo.Event.stageDeactivate, this.deactivateStageHandler);
};

DashboardAssistant.prototype.launchMain = function() {
	var appController = Mojo.Controller.getAppController();
	appController.assistant.handleLaunch();
	this.controller.window.close();
};

DashboardAssistant.prototype.activateStage = function() {
};

DashboardAssistant.prototype.deactivateStage = function() {
};
