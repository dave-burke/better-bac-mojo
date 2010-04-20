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
function DbUtils() {
	this.dbLoaded = false;
	this.stateLoaded = false;
	this.prefsLoaded = false;
	this.init();
}

DbUtils.prototype.init = function(){
	Mojo.Log.info("Loading database (asynchronous)...");
	this.db = new Mojo.Depot(
			{name: "net.snew.betterbac.db"}, this.onLoadDbSuccess.bind(this), this.onLoadDbFailure.bind(this));
	//Don't do this. state/prefs would be loaded before dbsuccess callback
	this.loadState();
	this.loadPrefs();
}

DbUtils.prototype.loadState = function(){
	Mojo.Log.info("Loading state...");
	this.db.get("state", this.onLoadStateSuccess.bind(this), this.onLoadStateFailure.bind(this));
}

DbUtils.prototype.loadPrefs = function(){
	Mojo.Log.info("Getting prefs...");
	this.db.get("prefs", this.onLoadPrefsSuccess.bind(this), this.onLoadPrefsFailure.bind(this));
}

DbUtils.prototype.save = function(){
	if(this.state){
		this.db.add("state", this.state, this.onSaveStateSuccess.bind(this), this.onSaveStateFailure.bind(this));
	}
	if(this.prefs){
		this.db.add("prefs", this.prefs, this.onSavePrefsSuccess.bind(this), this.onSavePrefsFailure.bind(this));
	}
}

/*
 * Save state callbacks
 */
DbUtils.prototype.onSaveStateSuccess = function(){
	Mojo.Log.info("Successfully saved state");
}

DbUtils.prototype.onSaveStateFailure = function(){
	Mojo.Controller.getAppController().showBanner("Save state failed with code " + code,
		{source: 'notification'});
}

/*
 * Save prefs callbacks
 */
DbUtils.prototype.onSavePrefsSuccess = function(){
	Mojo.Log.info("Successfully saved prefs");
	if(this.prefs){
		this.prefsLoaded = true;
	}else{
		
}

DbUtils.prototype.onSavePrefsFailure = function(){
	Mojo.Controller.getAppController().showBanner("Save prefs failed with code " + code,
		{source: 'notification'});
}

/*
 * Load DB callbacks
 */
DbUtils.prototype.onLoadDbSuccess = function(){
	Mojo.Log.info("Successfully loaded Depot database.");
	this.dbLoaded = true;
}
DbUtils.prototype.onLoadDbFailure = function(code){
	Mojo.Log.info("Depot database load failed with code ",code);
	Mojo.Controller.getAppController().showBanner("Depot database load failed with code " + code,
		     {source: 'notification'});
}

/*
 * Load state callbacks
 */
DbUtils.prototype.onLoadStateSuccess = function(value){
	this.state = value;
	if(!this.state){
		Mojo.Log.info("No state found in db, creating new state.");
		this.state = {
			bac: 0.0,
			lastUpdate: new Date().getTime(),
			drinks: [],
		};
		this.save();
	}else{
		Mojo.Log.info("Successfully loaded State: %j",this.state);
		this.stateLoaded = true;
	}
}
DbUtils.prototype.onLoadStateFailure = function(code){
	Mojo.Log.info("Loading state failed with code ",code);
	Mojo.Controller.getAppController().showBanner("Loading state failed with code " + code,
		     {source: 'notification'});
}

/*
 * Load prefs callbacks
 */
DbUtils.prototype.onLoadPrefsSuccess = function(value){
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
		this.save();
	}else{
		Mojo.Log.info("Successfully loaded prefs: %j",this.prefs);
		this.prefsLoaded = true;
	}

}
DbUtils.prototype.onLoadPrefsFailure = function(code){
	Mojo.Log.info("Loading prefs failed with code ",code);
	Mojo.Controller.getAppController().showBanner("Loading prefs failed with code " + code,
		     {source: 'notification'});
}
