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
}

StageAssistant.prototype.setup = function(){
	Mojo.Log.info("Loading database (asynchronous)...");
	this.db = new Mojo.Depot(
			{name: "net.snew.betterbac.db"}, this.onLoadDbSuccess.bind(this), this.onLoadDbFailure.bind(this));
}

/*
 * Load DB callbacks
 */
StageAssistant.prototype.onLoadDbSuccess = function(){
	Mojo.Log.info("Successfully loaded Depot database. Getting state...");
	this.db.get("state", this.onLoadStateSuccess.bind(this), this.onLoadStateFailure.bind(this));
}
StageAssistant.prototype.onLoadDbFailure = function(code){
	Mojo.Log.info("Depot database load failed with code ",code);
	Mojo.Controller.getAppController().showBanner("Depot database load failed with code " + code,
		     {source: 'notification'});
}

/*
 * Load state callbacks
 */
StageAssistant.prototype.onLoadStateSuccess = function(value){
	this.state = value;
	if(!this.state){
		Mojo.Log.info("No state found in db, creating new state.");
		this.state = {
			bac: 0.0,
			lastUpdate: new Date().getTime(),
			drinks: [],
		};
	}else{
		Mojo.Log.info("Successfully loaded State: %j",this.state);
	}
	Mojo.Log.info("Getting prefs...");
	this.db.get("prefs", this.onLoadPrefsSuccess.bind(this), this.onLoadPrefsFailure.bind(this));
}
StageAssistant.prototype.onLoadStateFailure = function(code){
	Mojo.Log.info("Loading state failed with code ",code);
	Mojo.Controller.getAppController().showBanner("Loading state failed with code " + code,
		     {source: 'notification'});
}

/*
 * Load prefs callbacks
 */
StageAssistant.prototype.onLoadPrefsSuccess = function(value){
	this.prefs = value;
	
	//If no prefs, also push prefs screen
	if(!this.prefs){
		this.prefs = {
				"gender": "m",
				"height": 68,
				"weight": 180,
				"age": 25,
				"limit": 0.08,
				"calc": "widmark",
				"historyMaxDays": 7,
				"historyMaxLength": 30,
			};
		this.cleanHistory();
		this.controller.pushScene("main", this.db, this.state, this.prefs);
		this.controller.pushScene("prefs", this.db, this.prefs);
	}else{
		Mojo.Log.info("Successfully loaded prefs: %j",this.prefs);
		this.cleanHistory();
		this.controller.pushScene("main", this.db, this.state, this.prefs);
	}

}
StageAssistant.prototype.onLoadPrefsFailure = function(code){
	Mojo.Log.info("Loading prefs failed with code ",code);
	Mojo.Controller.getAppController().showBanner("Loading prefs failed with code " + code,
		     {source: 'notification'});
}

/*
 * Clear State callbacks
 */
StageAssistant.prototype.onClearSuccess = function(){
	Mojo.Log.info("Successfully cleared state");
	Mojo.Controller.stageController.popScenesTo();
    this.controller.pushScene("main", this.db, this.state, this.prefs);
}
StageAssistant.prototype.onClearFailure = function(){
	Mojo.Log.info("Failed to cleared state");
	Mojo.Controller.getAppController().showBanner("Failed to cleared state",
		     {source: 'notification'});
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
            case 'do-myPrefs':
                Mojo.Controller.stageController.pushScene("prefs", this.db, this.prefs);
            	Mojo.Log.info("Prefs menu item");
                break;
            case 'do-help':
                Mojo.Controller.stageController.pushScene("help");
            	Mojo.Log.info("main help menu item");
                break;
            case 'do-help-prefs':
                Mojo.Controller.stageController.pushScene("help-prefs");
            	Mojo.Log.info("prefs help menu item");
                break;
            case 'do-help-new-drink':
                Mojo.Controller.stageController.pushScene("help-new-drink");
            	Mojo.Log.info("new-drink help menu item");
                break;
            case 'do-help-graph':
                Mojo.Controller.stageController.pushScene("help-graph");
            	Mojo.Log.info("graph help menu item");
                break;
            case 'do-myAbout':
                Mojo.Controller.stageController.pushScene("about");
                Mojo.Log.info("About menu item");
                break;
            case 'do-graph':
            	Mojo.Controller.stageController.pushScene("graph",this.db,this.state);
            	Mojo.Log.info("Graph menu item");
            	break;
            case 'do-clearState':
            	this.state = {
            			bac: 0.0,
            			lastUpdate: new Date().getTime(),
            			drinks: [],
            		};
            	this.db.add("state", this.state, this.onClearSuccess.bind(this), this.onClearFailure.bind(this));
            	break;
            default:
                break;
        }
        
    }
}
