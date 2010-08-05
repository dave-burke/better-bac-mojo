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
function DbUtils(dbName) {
}

DbUtils.prototype.loadDb = function(successCallback){
	Mojo.Log.info("Loading database (asynchronous)...");
	this.db = new Mojo.Depot(
			{name: Mojo.appInfo.id + ".db"}, successCallback, this.onLoadDbFailure.bind(this));
}

DbUtils.prototype.onLoadDbFailure = function(code){
	Mojo.Log.info("Depot database load failed with code ",code);
	Mojo.Controller.getAppController().showBanner("Depot database load failed with code " + code,
		     {source: 'notification'});
}

DbUtils.prototype.getState = function(successCallback){
	Mojo.Log.info("Loading state...");
	if(this.db){
		this.db.get("state", successCallback, this.onLoadStateFailure.bind(this));
	}else{
		Mojo.Controller.getAppController().showBanner("Can't load state, DB is undefined!",
			{source: 'notification'});
	}
}
		
DbUtils.prototype.onLoadStateFailure = function(code){
	Mojo.Log.info("Loading state failed with code ",code);
	Mojo.Controller.getAppController().showBanner("Loading state failed with code " + code,
		     {source: 'notification'});
}

DbUtils.prototype.getPrefs = function(successCallback){
	Mojo.Log.info("Getting prefs...");
	if(this.db){
		this.db.get("prefs", successCallback, this.onLoadPrefsFailure.bind(this));
	}else{
		Mojo.Controller.getAppController().showBanner("Can't load prefs, DB is undefined!",
			{source: 'notification'});
	}
}

DbUtils.prototype.onLoadPrefsFailure = function(code){
	Mojo.Log.info("Loading prefs failed with code ",code);
	Mojo.Controller.getAppController().showBanner("Loading prefs failed with code " + code,
		     {source: 'notification'});
}

DbUtils.prototype.saveState = function(value, callback){
	if(value){
		if(callback){
			this.db.add("state", value, callback, this.onSaveStateFailure.bind(this));
		}else{
			this.db.add("state", value, this.onSaveStateSuccess.bind(this), this.onSaveStateFailure.bind(this));
		}
	}
}
DbUtils.prototype.onSaveStateSuccess = function(){
	Mojo.Log.info("Successfully saved state");
}
DbUtils.prototype.onSaveStateFailure = function(){
	Mojo.Controller.getAppController().showBanner("Save state failed with code " + code,
		{source: 'notification'});
}

DbUtils.prototype.savePrefs = function(value, callback){
	if(value){
		if(isNaN(value.height)){
			Mojo.Controller.errorDialog("Height must be a number");
			value.height = 68;
		}
		if(value.height < 1.0){
			value.height = 1.0;
		}
		if(value.height > 120){
			value.height = 120;
		}
		
		if(isNaN(value.weight)){
			Mojo.Controller.errorDialog("Weight must be a number");
			value.weight = 180;
		}
		if(value.weight < 1.0){
			value.weight = 1.0;
		}
		if(value.weight > 1000){
			value.weight = 1000;
		}
		
		if(value.age < 0){
			value.age = 0;
		}
		if(value.age > 120){
			value.age = 120;
		}
		
		if(isNaN(value.limit)){
			Mojo.Controller.errorDialog("Limit must be a number");
			value.limit = 0.08;
		}
		if(value.limit < 0){
			value.limit = 0;
		}
		if(value.limit > 1){
			value.limit = 1;
		}
		if(callback){
			this.db.add("prefs", value, callback, this.onSavePrefsFailure.bind(this));
		}else{
			this.db.add("prefs", value, this.onSavePrefsSuccess.bind(this), this.onSavePrefsFailure.bind(this));
		}
	}
}
DbUtils.prototype.onSavePrefsSuccess = function(){
	Mojo.Log.info("Successfully saved prefs");
}
DbUtils.prototype.onSavePrefsFailure = function(){
	Mojo.Controller.getAppController().showBanner("Save prefs failed with code " + code,
		{source: 'notification'});
}
