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
	this.validator = new Validator();
	this.defaults = new Defaults();
	this.state = null;
	this.prefs = null;
	this.favDrinks = null;
	
	this.defaultedPrefs = null;
	this.defaultedState = null;
	this.defaultedFavDrinks = null;
}

/*
 * Load Database
 */
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

/*
 * Get state
 */
DbUtils.prototype.getState = function(successCallback){
	if(this.state == null){
		Mojo.Log.info("Loading state...");
		if(this.db){
			this.db.get("state", function(value){
				if(value){
					Mojo.Log.info("Successfully loaded state");
					this.state = value;
					this.defaultedState = false;
				}else{
					Mojo.Log.info("No state found, loading defaults");
					this.state = this.defaults.state;
					this.saveState();
					this.defaultedState = true;
				}
				successCallback(this.state);
			}.bind(this),
			this.onLoadStateFailure.bind(this));
		}else{
			Mojo.Controller.getAppController().showBanner("Can't load state, DB is undefined!",
					{source: 'notification'});
		}
	}else{
		Mojo.Log.info("Returning preloaded state");
		successCallback(this.state);
	}
}
DbUtils.prototype.onLoadStateFailure = function(code){
	Mojo.Log.info("Loading state failed with code ",code);
	Mojo.Controller.getAppController().showBanner("Loading state failed with code " + code,
		     {source: 'notification'});
}

/*
 * Get Prefs
 */
DbUtils.prototype.getPrefs = function(successCallback){
	if(this.prefs == null){
		Mojo.Log.info("Getting prefs...");
		if(this.db){
			this.db.get("prefs", function(value){
				if(value){
					Mojo.Log.info("Successfully loaded prefs");
					this.prefs = value;
					this.defaultedPrefs = false;
				}else{
					Mojo.Log.info("No prefs found, loading defaults");
					this.prefs = this.defaults.prefs;
					this.savePrefs();
					this.defaultedPrefs = true;
				}
				successCallback(this.prefs);
			}.bind(this),
			this.onLoadPrefsFailure.bind(this));
		}else{
			Mojo.Controller.getAppController().showBanner("Can't load prefs, DB is undefined!",
					{source: 'notification'});
		}
	}else{
		Mojo.Log.info("Returning preloaded prefs");
		successCallback(this.prefs);
	}
}
DbUtils.prototype.onLoadPrefsFailure = function(code){
	Mojo.Log.info("Loading prefs failed with code ",code);
	Mojo.Controller.getAppController().showBanner("Loading prefs failed with code " + code,
		     {source: 'notification'});
}

/*
 * Get favorite drinks
 */
DbUtils.prototype.getFavDrinks = function(successCallback){
	if(this.favDrinks == null){
		Mojo.Log.info("Getting favorite drinks...");
		if(this.db){
			this.db.get("favDrinks", function(value){
				if(value){
					Mojo.Log.info("Successfully loaded favorite drinks");
					this.favDrinks = value;
					this.defaultedFavDrinks = false;
				}else{
					Mojo.Log.info("No favorite drinks found, loading defaults");
					this.favDrinks = this.defaults.favDrinks;
					this.saveFavDrinks();
					this.defaultedFavDrinks = true;
				}
				successCallback(this.favDrinks);
			}.bind(this),
			this.onLoadFavDrinksFailure.bind(this));
		}else{
			Mojo.Controller.getAppController().showBanner("Can't load favorite drinks, DB is undefined!",
					{source: 'notification'});
		}
	}else{
		Mojo.Log.info("Returning preloaded favorite drinks");
		successCallback(this.favDrinks);
	}
}

DbUtils.prototype.onLoadFavDrinksFailure = function(code){
	Mojo.Log.info("Loading favorite drinks failed with code ",code);
	Mojo.Controller.getAppController().showBanner("Loading favorite drinks failed with code " + code,
		     {source: 'notification'});
}

/*
 * Save state
 */
DbUtils.prototype.saveState = function(value, callback){
	if(value){
		this.state = value;
		if(callback){
			this.db.add("state", value, callback, this.onSaveStateFailure.bind(this));
		}else{
			this.db.add("state", value, this.onSaveStateSuccess.bind(this), this.onSaveStateFailure.bind(this));
		}
	}else{
		this.db.add("state", this.state, this.onSaveStateSuccess.bind(this), this.onSaveStateFailure.bind(this));
	}
}
DbUtils.prototype.onSaveStateSuccess = function(){
	Mojo.Log.info("Successfully saved state");
}
DbUtils.prototype.onSaveStateFailure = function(){
	Mojo.Controller.getAppController().showBanner("Save state failed with code " + code,
		{source: 'notification'});
}

/*
 * Save prefs
 */
DbUtils.prototype.savePrefs = function(value, callback){
	if(value){
		this.prefs = value;
		this.validator.validatePrefs(this.prefs);
		if(callback){
			this.db.add("prefs", value, callback, this.onSavePrefsFailure.bind(this));
		}else{
			this.db.add("prefs", value, this.onSavePrefsSuccess.bind(this), this.onSavePrefsFailure.bind(this));
		}
	}else{
		this.db.add("prefs", this.prefs, this.onSavePrefsSuccess.bind(this), this.onSavePrefsFailure.bind(this));
	}
}
DbUtils.prototype.onSavePrefsSuccess = function(){
	Mojo.Log.info("Successfully saved prefs");
}
DbUtils.prototype.onSavePrefsFailure = function(){
	Mojo.Controller.getAppController().showBanner("Save prefs failed with code " + code,
		{source: 'notification'});
}

/*
 * Save favorite drinks
 */
DbUtils.prototype.saveFavDrinks = function(value, callback){
	if(value){
		this.favDrinks = value;
		if(callback){
			this.db.add("favDrinks", value, callback, this.onSaveFavDrinksFailure.bind(this));
		}else{
			this.db.add("favDrinks", value, this.onSaveFavDrinksSuccess.bind(this), this.onSaveFavDrinksFailure.bind(this));
		}
	}else{
		this.db.add("favDrinks", this.favDrinks, this.onSaveFavDrinksSuccess.bind(this), this.onSaveFavDrinksFailure.bind(this));
	}
}
DbUtils.prototype.onSaveFavDrinksSuccess = function(){
	Mojo.Log.info("Successfully saved favorite drinks");
}
DbUtils.prototype.onSaveFavDrinksFailure = function(){
	Mojo.Controller.getAppController().showBanner("Save favorite drinks failed with code " + code,
		{source: 'notification'});
}
