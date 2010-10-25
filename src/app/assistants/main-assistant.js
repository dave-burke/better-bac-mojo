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
function MainAssistant(db, state, prefs) {
	this.db = db;
	this.state = state;
	this.prefs = prefs;
	this.formatUtils = new FormatUtils();
	this.bacUtils = new BacUtils();
	this.timeoutUtils = new TimeoutUtils();
}

MainAssistant.prototype.saveState = function(){
	this.db.saveState(this.state, function(){
		/* If this doesn't happen inside a callback function, then it doesn't work right.
		 * I'll be damned if I know why that makes any sense at all.
		 */
		var drinksList = this.controller.get("drinksList");
		drinksList.mojo.noticeUpdatedItems(0,this.state.drinks);
	}.bind(this));
};

MainAssistant.prototype.activateRefresh = function(){
	if(!this.autoUpdate){
		Mojo.Log.info("Setting refresh interval");
		this.refresh();
		var interval = 30000;
		this.autoUpdate = this.controller.window.setInterval(this.refresh.bind(this),interval);
	}else{
		Mojo.Log.info("Interval already set");
	}
};

MainAssistant.prototype.deactivateRefresh = function(){
	if(this.autoUpdate){
		this.refresh();
	   	Mojo.Log.info("Clearing refresh interval");
		this.controller.window.clearInterval(this.autoUpdate);
		this.autoUpdate = null;
	}else{
		Mojo.Log.info("Interval not set");
	}
};

MainAssistant.prototype.refresh = function(){
	this.soberUp(this.getTimeSinceLastUpdate());
	this.updateStatus();
};

MainAssistant.prototype.setup = function() {
	
	Mojo.Log.info("Setting up widgets");
	
	this.controller.setupWidget("drinksList",
		this.attributes = {
			itemTemplate: "main/drink-list-entry",
			listTemplate: "main/drink-list-container",
			dividerTemplate:"main/divider", 
			dividerFunction: this.divideHistory.bind(this),
			formatters:{
				name:this.formatUtils.formatName.bind(this.formatUtils),
				time:this.formatUtils.formatDateTime.bind(this.formatUtils),
				abv:this.formatUtils.formatAbv.bind(this.formatUtils),
				vol:this.formatUtils.formatVol.bind(this.formatUtils),
				bacWhenAdded: this.formatUtils.formatBac.bind(this.formatUtils),
				bac: this.formatTimeUntilProcessed.bind(this)
			},
			swipeToDelete: true,
			reorderable: false
		},
		this.model = {
			listTitle: $L("Drinks you've had"),
			items: this.state.drinks
		}
	);
	
	
	this.cmdMenuModel = {
		items: [
			{label: "Add", command: "add-cmd"},
			//{label: "Preferences", command: "do-myPrefs"},
			{label: "Graph", command: "do-graph"}
		]
	};
	this.controller.setupWidget(Mojo.Menu.commandMenu, this.handleCommand, this.cmdMenuModel);
	
	this.appMenuAttr = {
		omitDefaultItems: true
	};
	this.appMenuModel = {
		visible: true,
		items: [ 
			{ label: "About", command: "do-myAbout"},
			{ label: "Preferences", command: "do-myPrefs"},
			{ label: "Review this app", command: "do-appCatalog"},
			{ label: "Clear all drinks", command: "do-clearState"},
			{ label: "Help", command: "do-help"}
		]
	};
	this.controller.setupWidget(Mojo.Menu.appMenu, this.appMenuAttr, this.appMenuModel);
	
	this.activateRefresh();
};

MainAssistant.prototype.activate = function(newDrink) {
	if(!this.prefs.alarms){
		Mojo.Log.info("Alarms are turned off. Clearing existing alarms (if any)");
		this.timeoutUtils.clearAll();
	}
	
	Mojo.Log.info("Drinks in activate = %j", this.state.drinks);
	Mojo.Log.info("Setting main event listeners");
	this.drinksList = this.controller.get("drinksList");
	
	this.drinkDeleteHandler = this.handleDrinkDelete.bind(this);
	Mojo.Event.listen(this.drinksList, Mojo.Event.listDelete, this.drinkDeleteHandler);
	
	this.drinkTapHandler = this.handleDrinkTap.bind(this);
	Mojo.Event.listen(this.drinksList, Mojo.Event.listTap, this.drinkTapHandler);
	
	this.stageActivateHandler = this.activateRefresh.bind(this);
	Mojo.Event.listen(Mojo.Controller.stageController.document, Mojo.Event.stageActivate, this.stageActivateHandler);
	
	this.stageDeactivateHandler = this.deactivateRefresh.bind(this);
	Mojo.Event.listen(Mojo.Controller.stageController.document, Mojo.Event.stageDeactivate, this.stageDeactivateHandler);
	
	// Process new drinks, if any
	if(newDrink){
		Mojo.Log.info("Received a newDrink: %j",newDrink);
		if (this.isValid(newDrink)) {
			this.addDrink(newDrink);
			this.saveFavorite(newDrink);
		}
	}
	this.activateRefresh();
};

MainAssistant.prototype.formatTimeUntilProcessed = function(bac, model){
	var bacAhead = 0;
	for(var i=this.state.drinks.length - 1;i>=0;i--){
		var drink = this.state.drinks[i];
		bacAhead += drink.bac;
		if(model.time == drink.time){
			if(bacAhead == 0){
				return "";
			}else{
				var message = "Time left in your system: "
				message += this.bacUtils.calcTimeTo(bacAhead,0);
				return message;
			}
		}
	}
	return "N/A";
}


MainAssistant.prototype.divideHistory = function(item){
	if(item){
		if(item.bac == 0){
			return "Out of your system";
		}else{
			if(item.bac < item.origBac){
				return "Being processed";
			}else{
				return "In your system";
			}
		}
	}
};

MainAssistant.prototype.handleCommand = function(event){
	if (event.type === Mojo.Event.command) {
		switch (event.command) {
			case 'do-appCatalog':
				Mojo.Log.info("Loading app catalog");
				var appUrl = 'http://developer.palm.com/appredirect/?packageid=' + Mojo.appInfo.id;
				new Mojo.Service.Request('palm://com.palm.applicationManager', {
					method: "open",
					parameters: {
				     	target: appUrl
				   	}
				});
				event.stopPropagation();
				break;
			case "add-cmd":
				//Mojo.Controller.stageController.pushScene("custom-drink", this.state, this.prefs);
				Mojo.Controller.stageController.pushScene("fav-drinks", this.db, this.prefs);
				event.stopPropagation();
				break;
			case 'do-graph':
				Mojo.Controller.stageController.pushScene("graph",this.db,this.state);
				Mojo.Log.info("Graph menu item");
				event.stopPropagation();
				break;
			case 'do-clearState':
				this.controller.showAlertDialog({
					onChoose: function(choice){
							if(choice){
								Mojo.Log.info("Clearing state!");
								this.state = {
										bac: 0.0,
										lastUpdate: new Date().getTime(),
										drinks: []
									};
								this.db.saveState(this.state);
								this.timeoutUtils.clearAll();
								Mojo.Controller.stageController.popScenesTo();
								Mojo.Controller.stageController.pushScene("main", this.db, this.state, this.prefs);
							}
						}.bind(this),
					message: "Are you sure you want to clear all your drink history?",
					choices: [
					    {label: "Yes", value: true, type: "affirmative"},
					    {label: "No", value: false, type: "negative"}
					]
				});
				event.stopPropagation();
				break;
		}
	}
};

MainAssistant.prototype.handleDrinkDelete = function(event){
	Mojo.Log.info("Deleting drink at %i: %s",event.index, this.state.drinks[event.index].name);
	this.state.drinks.splice(event.index,1);
	
	//Recalculate from zero
	this.recalculate();
	
	//Update display
	this.updateStatus();
};

MainAssistant.prototype.handleDrinkTap = function(event){
	Mojo.Controller.stageController.pushScene("custom-drink", this.prefs, event.item);
};

MainAssistant.prototype.isValid = function(drink){
	if (drink) {
		var name = drink.name;
		if (!name || name == "") {
			Mojo.Log.info("Drink name was empty or undefined");
			Mojo.Controller.errorDialog("Drink name was invalid");
			return false;
		}
		
		var vol = drink.vol;
		if (!vol || isNaN(vol) || vol <= 0) {
			Mojo.Log.info("Drink vol was 0, NaN, or undefined");
			Mojo.Controller.errorDialog("Drink volume was invalid");
			return false;
		}
		
		var abv = drink.abv / 100;
		if (!abv || isNaN(abv) || abv <= 0 || abv >= 1) {
			Mojo.Log.info("Drink abv was negative, > 1, NaN, or undefined");
			Mojo.Controller.errorDialog("Drink abv was invalid");
			return false;
		}
	}else{
		Mojo.Log.info("drink is undefined!");
	}
	Mojo.Log.info("Drink is valid");
	return true;
};

MainAssistant.prototype.saveFavorite = function(newDrink){
	this.db.getFavDrinks(function(value){
		if(value){
			var favDrinks = value;
			var exists = false;
			for(var i = 0;i<favDrinks.length;i++){
				var drink = favDrinks[i];
				if(drink.name == newDrink.name){
					if(drink.abv != newDrink.abv || drink.vol != newDrink.vol){
						drink.updated = new Date().getTime();
					}
					drink.abv = newDrink.abv;
					drink.vol = newDrink.vol;
					drink.units = newDrink.units;
					drink.count++;
					drink.lastTime = new Date().getTime();
					favDrinks[i] = drink;
					exists = true;
					break;
				}
			}
			if(!exists){
				var newFav = {
						name: newDrink.name,
						abv: newDrink.abv,
						vol: newDrink.vol,
						units: newDrink.units,
						count: 0,
						updated: new Date().getTime(),
						lastTime: new Date().getTime()
					}
				favDrinks.push(newFav);
			}
			this.db.saveFavDrinks(favDrinks);
		}else{
			Mojo.Log.info("Db didn't return a value for favDrinks");
		}
	}.bind(this));
};

MainAssistant.prototype.addDrink = function(newDrink){
	Mojo.Log.info("Adding drink: %j",newDrink);
	
	//Insert the drink
	var inserted = -1;
	for(var i=0;i<this.state.drinks.length;i++){
		if(newDrink.time > this.state.drinks[i].time){
			Mojo.Log.info("Found insertion point at ",i);
			this.state.drinks.splice(i,0,newDrink);
			inserted = i;
			break;
		}
	}
	if(inserted == -1){
		Mojo.Log.info("Pushing oldest drink");
		this.state.drinks.push(newDrink);
	}
	
	//Recalculate from zero
	this.recalculate();
	
	//Update display
	this.updateStatus();
};

MainAssistant.prototype.recalculate = function(){
	Mojo.Log.info("Recalculating for: %j",this.state.drinks);
	if(this.state.drinks.length == 0){
		this.state.bac = 0;
		this.state.lastUpdate = new Date().getTime();
		//If there are no drinks, there's nothing to recalculate
	}else{
		this.state.bac = 0;
		this.state.lastUpdate = this.state.drinks[this.state.drinks.length - 1].time;

		for(var i=this.state.drinks.length - 1;i>=0;i--){
			var drink = this.state.drinks[i];
			this.soberUp(drink.time - this.state.lastUpdate);

			//reset drink
			drink.bac = drink.origBac;
			drink.bacWhenAdded = this.state.bac;

			this.state.bac += drink.bac;
			this.state.lastUpdate = drink.time;
		}
	}
	this.soberUp(this.getTimeSinceLastUpdate());
	this.setAlarms();
	Mojo.Log.info("New drinksList is: %j",this.state.drinks);
};

MainAssistant.prototype.soberUp = function(millis){
	var bacDelta = this.bacUtils.calcBacDecrease(millis);
	
	this.state.bac -= bacDelta;
	if(this.state.bac < 0){
		this.state.bac = 0;
	}
	
	for(var i = this.state.drinks.length - 1;i>=0;i--){
		var drink = this.state.drinks[i];
		if(drink.bac == 0){
			//skip
		}else if(drink.bac <= bacDelta){
			//Mojo.Log.info("%s bac (%d) is less than %d. This drink is history",drink.name, drink.bac, bacDelta);
			bacDelta -= drink.bac;
			drink.bac = 0;
		}else{
			//Mojo.Log.info("%s bac (%d) is greater than %d. This drink is still current",drink.name, drink.bac, bacDelta);
			drink.bac -= bacDelta;
			bacDelta = 0;
			break;
		}
	}
};

MainAssistant.prototype.updateStatus = function(){
	Mojo.Log.info("Updating status...");
	var roundedBac = this.bacUtils.roundBac(this.state.bac);
	if(roundedBac <= 0){
		Mojo.Log.info("Rounded BAC is zero. Clearing BAC");
		// close enough
		roundedBac = 0;
		this.soberUp(60000); //just sober up enough to clear everything
		this.state.bac = 0;
	}
	
	//Mojo.Log.info("Updating display widgets");
	this.controller.get("currentBac").update(roundedBac);
	
	var timeToLimit = this.bacUtils.calcTimeTo(this.state.bac, this.prefs.limit);
	this.controller.get("timeToLimit").update(timeToLimit);
	
	var timeToZero = this.bacUtils.calcTimeTo(this.state.bac, 0);
	this.controller.get("timeToZero").update(timeToZero);

	this.saveState();
};

MainAssistant.prototype.getTimeSinceLastUpdate = function(){
	var newUpdateTime = new Date().getTime();
	var milliseconds = newUpdateTime - this.state.lastUpdate;
	this.state.lastUpdate = newUpdateTime;
	
	return milliseconds;
};

MainAssistant.prototype.setAlarms = function(){
	if(this.prefs.alarms){
		var timeToLimit = this.bacUtils.calcTimeTo(this.state.bac, this.prefs.limit, true);
		this.timeoutUtils.setAtLimit(timeToLimit);
	
		var timeToZero = this.bacUtils.calcTimeTo(this.state.bac, 0, true);
		this.timeoutUtils.setAtZero(timeToZero);
	}else{
		Mojo.Log.info("Alarms disabled. Not setting");
	}
};

MainAssistant.prototype.debugDrinks = function(drinks, abridged, message){
	if(message){
		Mojo.Log.info(message);
	}
	if(abridged){
		var s = "";
		for(var i = 0;i<drinks.length;i++){
			if(i!=0){
				s = s + ", ";
			}
			s = s + drinks[i].name;
		}
		Mojo.Log.info(s);
	}else{
		for(var i = 0;i<drinks.length;i++){
			Mojo.Log.info("%s @ %o : %d + %d (%d)",drinks[i].name,new Date(drinks[i].time),drinks[i].bacWhenAdded,drinks[i].origBac, drinks[i].bac);
		}
	}
};

MainAssistant.prototype.deactivate = function(){
	Mojo.Log.info("Clearing main event listeners");
	Mojo.Event.stopListening(this.drinksList, Mojo.Event.listDelete, this.drinkDeleteHandler);
	Mojo.Event.stopListening(this.drinksList, Mojo.Event.listTap, this.drinkTapHandler);
	Mojo.Event.stopListening(Mojo.Controller.stageController.document, Mojo.Event.stageActivate, this.stageActivateHandler);
	Mojo.Event.stopListening(Mojo.Controller.stageController.document, Mojo.Event.stageDeactivate, this.stageDeactivateHandler);
	
	this.deactivateRefresh();
};
