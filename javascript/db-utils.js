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
var STATUS_UNLOADED = 0;
var STATUS_LOADING = 1;
var STATUS_LOADED = 2;
var STATUS_FAILED = -1;
function DbUtils(dbName) {
	this.dbStatus = STATUS_UNLOADED;
	this.status = {
			"state":STATUS_UNLOADED,
			"prefs":STATUS_UNLOADED
	}
	
	this.values = {};

	Mojo.Log.info("Loading database (asynchronous)...");
	this.db = new Mojo.Depot(
			{name: "net.snew.betterbac.db"}, this.onLoadDbSuccess.bind(this), this.onLoadDbFailure.bind(this));
	this.dbStatus = STATUS_LOADING;
}

/*
 * Load DB callbacks
 */
DbUtils.prototype.onLoadDbSuccess = function(){
	Mojo.Log.info("Successfully loaded Depot database.");
	this.dbStatus = STATUS_LOADED;
	this.loadState();
	this.loadPrefs();
}
DbUtils.prototype.onLoadDbFailure = function(code){
	Mojo.Log.info("Depot database load failed with code ",code);
	this.dbStatus = STATUS_FAILED;
	Mojo.Controller.getAppController().showBanner("Depot database load failed with code " + code,
		     {source: 'notification'});
}

DbUtils.prototype.loadState = function(){
	Mojo.Log.info("Loading state...");
	this.db.get("state", this.onLoadStateSuccess.bind(this), this.onLoadStateFailure.bind(this));
	this.status["state"] = STATUS_LOADING;
}

DbUtils.prototype.loadPrefs = function(){
	Mojo.Log.info("Getting prefs...");
	this.db.get("prefs", this.onLoadPrefsSuccess.bind(this), this.onLoadPrefsFailure.bind(this));
	this.status["prefs"] = STATUS_LOADING;
}

/*
 * Load state callbacks
 */
DbUtils.prototype.onLoadStateSuccess = function(value){
	this.values["state"] = value;
	if(!this.values["state"]){
		Mojo.Log.info("No state found in db, creating new state.");
		this.values["state"] = {
			bac: 0.0,
			lastUpdate: new Date().getTime(),
			drinks: []
		};
		this.saveState();
	}else{
		Mojo.Log.info("Successfully loaded State: %j",this.values["state"]);
		this.status["state"] = STATUS_LOADED;
	}
}
DbUtils.prototype.onLoadStateFailure = function(code){
	Mojo.Log.info("Loading state failed with code ",code);
	Mojo.Controller.getAppController().showBanner("Loading state failed with code " + code,
		     {source: 'notification'});
	this.status["state"] = STATUS_LOADED;
}

/*
 * Load prefs callbacks
 */
DbUtils.prototype.onLoadPrefsSuccess = function(value){
	this.values["prefs"] = value;
	
	//If no prefs, also push prefs screen
	if(!this.values["prefs"]){
		this.values["prefs"] = {
				"gender": "m",
				"height": 68,
				"weight": 180,
				"age": 25,
				"limit": 0.08,
				"calc": "widmark",
				"historyMaxDays": 7,
				"historyMaxLength": 30
			};
		this.savePrefs();
	}else{
		Mojo.Log.info("Successfully loaded prefs: %j",this.values["prefs"]);
		this.status["prefs"] = STATUS_LOADED;
	}
	
}
DbUtils.prototype.onLoadPrefsFailure = function(code){
	Mojo.Log.info("Loading prefs failed with code ",code);
	Mojo.Controller.getAppController().showBanner("Loading prefs failed with code " + code,
		     {source: 'notification'});
	this.status["prefs"] = STATUS_FAILED;
}

DbUtils.prototype.saveState = function(){
	if(this.values["state"]){
		this.db.add("state", this.values["state"], this.onSaveStateSuccess.bind(this), this.onSaveStateFailure.bind(this));
	}
}
/*
 * Save state callbacks
 */
DbUtils.prototype.onSaveStateSuccess = function(){
	Mojo.Log.info("Successfully saved state");
	this.status["state"] = STATUS_LOADED;
}
DbUtils.prototype.onSaveStateFailure = function(){
	Mojo.Controller.getAppController().showBanner("Save state failed with code " + code,
		{source: 'notification'});
	this.status["state"] = STATUS_FAILED;
}

DbUtils.prototype.savePrefs = function(){
	if(this.values["prefs"]){
		this.db.add("prefs", this.values["prefs"], this.onSavePrefsSuccess.bind(this), this.onSavePrefsFailure.bind(this));
	}
}
/*
 * Save prefs callbacks
 */
DbUtils.prototype.onSavePrefsSuccess = function(){
	Mojo.Log.info("Successfully saved prefs");
	this.status["prefs"] = STATUS_LOADED;
		
}
DbUtils.prototype.onSavePrefsFailure = function(){
	Mojo.Controller.getAppController().showBanner("Save prefs failed with code " + code,
		{source: 'notification'});
	this.status["prefs"] = STATUS_FAILED;
}

/*
 * Getter
 */
DbUtils.prototype.getValue = function(key){
	Mojo.Log.info("Getting " + key);

	var status = this.status[key];
	switch(status){
	case(-1):
		Mojo.Controller.getAppController().showBanner(key + " failed to load!",
				{source: 'notification'});
		return null;
	case(0):
		switch(this.dbStatus){
		case(-1):
			Mojo.Controller.getAppController().showBanner("db failed to load!",
				{source: 'notification'});
			return null;
		case(0):
			Mojo.Controller.getAppController().showBanner("db was never loaded!",
					{source: 'notification'});
			return null;
		case(1):
			//Mojo.Log.info("db is still loading.");
			return this.getValue(key);
		case(2):
			Mojo.Controller.getAppController().showBanner(key + " was never loaded!",
					{source: 'notification'});
			return null;
		}
		break;
	case(1):
		//Mojo.Log.info(key + " is still loading.");
		return this.getValue(key);
	}
	Mojo.Log.info("Got " + key);
	return this.values[key];
}
