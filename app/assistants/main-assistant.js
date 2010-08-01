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
function MainAssistant(dbUtils, state, prefs) {
	this.dbUtils = dbUtils;
	this.state = state;
	this.prefs = prefs;
	this.bacUtils = new BacUtils();
}

MainAssistant.prototype.saveState = function(){
	this.dbUtils.saveState(this.state);
	var drinksList = this.controller.get("drinksList");
	if(drinksList.mojo){
		drinksList.mojo.noticeUpdatedItems(0,this.state.drinks);
	}
}

MainAssistant.prototype.activateRefresh = function(){
    this.refresh();
	if(!this.autoUpdate){
	    Mojo.Log.info("Setting refresh interval");
	    var interval = 30000;
		this.autoUpdate = this.controller.window.setInterval(this.refresh.bind(this),interval);
	}
}

MainAssistant.prototype.refresh = function(){
	this.soberUp(this.getTimeSinceLastUpdate());
	this.updateStatus();
}

MainAssistant.prototype.deactivateRefresh = function(){
    this.refresh();
	if(this.autoUpdate){
	   	Mojo.Log.info("Clearing refresh interval");
		this.controller.window.clearInterval(this.autoUpdate);
		this.autoUpdate = null;
	 }
}

MainAssistant.prototype.setup = function() {
	
	Mojo.Log.info("Setting up widgets");
		
	this.controller.setupWidget("drinksList",
		this.attributes = {
        	itemTemplate: "main/drink-list-entry",
            listTemplate: "main/drink-list-container",
            dividerTemplate:"main/divider", 
            dividerFunction: this.divideHistory.bind(this),
			formatters:{
				name:this.formatName.bind(this),
				time:this.formatDateTime.bind(this),
				abv:this.formatAbv.bind(this),
				vol:this.formatVol.bind(this),
				bac: this.formatBac.bind(this)
			},
            //addItemLabel: $L("Add a drink"),
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
		    //{ label: "Graph BAC", command: "do-graph"},
		    { label: "Clear all drinks", command: "do-clearState"},
		    { label: "Preferences", command: "do-myPrefs"},
		    { label: "Help", command: "do-help"}
	    ]
	};
    this.controller.setupWidget(Mojo.Menu.appMenu, this.appMenuAttr, this.appMenuModel);
    
	this.activateRefresh();
}

MainAssistant.prototype.activate = function(newDrink) {
	Mojo.Log.info("Setting main event listeners");
	this.drinksList = this.controller.get("drinksList");
	
    this.addButtonHandler = this.handleAddButton.bind(this);
    Mojo.Event.listen(this.drinksList, Mojo.Event.listAdd, this.addButtonHandler);
	
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
		Mojo.Log.info("Received a newDrink: %s",newDrink.name);
		if (this.isValid(newDrink)) {
			this.addDrink(newDrink);
		}
	}else{
	    this.refresh();
	}
}

MainAssistant.prototype.divideHistory = function(item){
	if(item){
		if(item.bac == 0){
			return "History";
		}else{
			return "Current";
		}
	}
}

MainAssistant.prototype.formatName = function(name, model){
	return name;
}

MainAssistant.prototype.formatTime = function(time, model) {
	var date = new Date(time);
	var minutes = String(date.getMinutes());
	if(minutes.length == 1){
		minutes = "0" + minutes;
	}
	var hours = date.getHours();
	if(hours >= 12){
		if (hours > 12) {
			hours = hours - 12;
		}
		return hours + ":" + minutes + " PM";
	}else{
		return hours + ":" + minutes + " AM";
	}
}

MainAssistant.prototype.formatDateTime = function(time, model) {
	var date = new Date(time);
	
	//Format date
	var month = date.getMonth() + 1;
	var day = date.getDate();
	var year = date.getFullYear();
	
	var dateString = month + "/" + day;// + "/" + year;
	
	//Format time
	var timeString = this.formatTime(time,model);
	return dateString + " " + timeString;
}

MainAssistant.prototype.formatAbv = function(abv, model) {
	return abv + "%";
}

MainAssistant.prototype.formatVol = function(vol, model) {
	return vol + " oz.";
}

MainAssistant.prototype.formatBac = function(bac, model) {
	var roundedBac = String(this.bacUtils.roundBac(bac));
	var roundedOrigBac = String(this.bacUtils.roundBac(model.origBac));
	if(roundedBac == 0){
		return roundedOrigBac;
	}else{
		return roundedBac + " / " + roundedOrigBac;
	}
}

MainAssistant.prototype.handleCommand = function(event){
	if (event.type === Mojo.Event.command) {
		switch (event.command) {
			case "add-cmd":
				Mojo.Controller.stageController.pushScene("new-drink", this.state, this.prefs);
				break;
		}
	}
}

MainAssistant.prototype.handleAddButton = function(event){
	Mojo.Controller.stageController.pushScene("new-drink", this.state, this.prefs);
}

MainAssistant.prototype.handleDrinkDelete = function(event){
	Mojo.Log.info("Deleting drink at %i: %s",event.index, this.state.drinks[event.index].name);
	this.state.drinks.splice(event.index,1);
	
	//Recalculate from zero
	this.recalculate();
	
	//Update display
	this.updateStatus();
}

MainAssistant.prototype.handleDrinkTap = function(event){
	Mojo.Controller.stageController.pushScene("new-drink", this.state, this.prefs, event.item);
}

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
}

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
}

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
	Mojo.Log.info("New state is: %j",this.state.drinks);
}

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
			Mojo.Log.info("%s bac (%d) is less than %d. This drink is history",drink.name, drink.bac, bacDelta);
			bacDelta -= drink.bac;
            drink.bac = 0;
		}else{
			Mojo.Log.info("%s bac (%d) is greater than %d. This drink is still current",drink.name, drink.bac, bacDelta);
			drink.bac -= bacDelta;
			bacDelta = 0;
			break;
		}
	}
}

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
	
	Mojo.Log.info("Updating display widgets");
	this.controller.get("currentBac").update(roundedBac);
	
	var timeToLimit = this.bacUtils.calcTimeTo(this.state.bac, this.prefs.limit);
	this.controller.get("timeToLimit").update(timeToLimit);
	
	var timeToZero = this.bacUtils.calcTimeTo(this.state.bac, 0);
	this.controller.get("timeToZero").update(timeToZero);

	this.saveState();
}

MainAssistant.prototype.getTimeSinceLastUpdate = function(){
	var newUpdateTime = new Date().getTime();
	var milliseconds = newUpdateTime - this.state.lastUpdate;
	this.state.lastUpdate = newUpdateTime;
	
	return milliseconds;
}

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
}

MainAssistant.prototype.setLimitAlarm = function(){
}

MainAssistant.prototype.setZeroAlarm = function(){
	
}

MainAssistant.prototype.deactivate = function(){
	Mojo.Log.info("Clearing main event listeners");
	Mojo.Event.stopListening(this.drinksList, Mojo.Event.listAdd, this.addButtonHandler);
	Mojo.Event.stopListening(this.drinksList, Mojo.Event.listDelete, this.drinkDeleteHandler);
	Mojo.Event.stopListening(this.drinksList, Mojo.Event.listTap, this.drinkTapHandler);
    Mojo.Event.stopListening(Mojo.Controller.stageController.document, Mojo.Event.stageActivate, this.stageActivateHandler);
    Mojo.Event.stopListening(Mojo.Controller.stageController.document, Mojo.Event.stageDeactivate, this.stageDeactivateHandler);
}