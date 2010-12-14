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
function StageAssistant(){
	this.db = new DbUtils();
	this.mojoUtils = new MojoUtils(this);
}

StageAssistant.prototype.setup = function(){
	this.db.loadDb(function(){
		this.db.getState(function(value){
			this.state = value;
			if(this.state){
				this.db.getPrefs(function(value){
					this.prefs = value;
					if(!this.prefs){
						Mojo.Log.info("db returned no prefs. That's not supposed to happen.");
					}else{
						this.cleanHistory();
						this.controller.pushScene("main", this.db, this.state, this.prefs);
						if(this.db.defaultedPrefs){
							Mojo.Log.info("Prefs were defaulted. Pushing prefs scene.");
							this.controller.pushScene("prefs", this.db, this.prefs);
						}else{
							Mojo.Log.info("Prefs were loaded. Don't push prefs scene");
						}
						if(this.mojoUtils.isFirstTime("welcome-message")){
							this.controller.pushScene("first-time");
						}
					}
				}.bind(this));
			}else{
				Mojo.Log.info("db didn't return a state. That's not supposed to happen.");
			}
		}.bind(this));
	}.bind(this));
}

StageAssistant.prototype.cleanHistory = function(){
	//Remove items that are from further back than the max history days
	var oldestHistoryTime = new Date().getTime() - (this.prefs.historyMaxDays * 86400000);
	var historyCount = 0;
	for(var i = 0;i<this.state.drinks.length;i++){
		var drink = this.state.drinks[i];
		if(drink.bac > 0){
			continue; //current drink
		}else if(historyCount >= this.prefs.historyMaxLength){
			//Too many history items
			Mojo.Log.info("There are more than %i drinks at %i",this.prefs.historyMaxLength,i);
		   	this.cleanHistoryAt(i);
			break;
		}else if(drink.time < oldestHistoryTime){
			//History items too old
			Mojo.Log.info("Drinks at %i are older than %i days",i,this.prefs.historyMaxDays);
			this.cleanHistoryAt(i);
			break;
		}else{
			historyCount++;
		}
	}
}

StageAssistant.prototype.cleanHistoryAt = function(cleanPoint){
	var cleanedItems = this.state.drinks.splice(cleanPoint,this.state.drinks.length - cleanPoint);
	Mojo.Log.info("Cleaned items from history", cleanedItems);
}

StageAssistant.prototype.handleCommand = function(event){
	if (event.type == Mojo.Event.command) {
		switch (event.command) {
			case 'do-prefs':
				Mojo.Controller.stageController.pushScene("prefs", this.db, this.prefs);
				Mojo.Log.info("Prefs menu item");
				break;
			case 'do-help':
				Mojo.Log.info("main help menu item");
				Mojo.Controller.stageController.pushScene("help");
				break;
			case 'do-about':
				Mojo.Controller.stageController.pushScene("about");
				Mojo.Log.info("About menu item");
				break;
			default:
				Mojo.Log.info("Unknown command: " + event.command);
				break;
		}
		
	}
}