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
function GraphAssistant(db, state) {
	this.db = db;
	this.state = state;
	this.bacUtils = new BacUtils();
}

GraphAssistant.prototype.setup = function() {
	this.controller.setupWidget("graphSelector",
	    this.attributes = {
			label: $L("Graph Type"),
	        choices: [
	  	        {label: $L("All"), value: "all"},
	            {label: $L("24 Hours"),value: "24h"},
	            {label: $L("12 Hours"),value: "12h"},
	        ],
		},
	    this.model = {
	        value: "12h",
	    }
	);
	
	this.controller.serviceRequest('palm://com.palm.systemservice', {
	    method: 'time/getSystemTime',
	    parameters: {subscribe:false},
		onSuccess: this.handleTime.bind(this),
        onFailure: this.handleTime.bind(this)
	});
	
	this.appMenuAttr = {
	    omitDefaultItems: true
	};
	this.appMenuModel = {
		visible: true,
		items: [ 
		    { label: "About", command: 'do-myAbout'},
		    { label: "Help for this scene", command: 'do-help-graph'},
	    ]
	};
	this.controller.setupWidget(Mojo.Menu.appMenu, this.appMenuAttr, this.appMenuModel);
}

GraphAssistant.prototype.activate = function(event){
	Mojo.Log.info("Setting graph event listeners");
	this.changeGraphHandler = this.changeGraphType.bind(this);
	this.graphSelector = this.controller.get("graphSelector");
	Mojo.Event.listen(this.graphSelector, Mojo.Event.propertyChange, this.changeGraphHandler);
}

GraphAssistant.prototype.handleTime = function(response) {
	this.offset = response.offset;
	if(!this.offset){
		Mojo.Log.info("Failed to get system time");
		this.offset = 0;
	}else{
		this.offset = this.offset * 60 * 1000; //convert offset minutes -> milliseconds
	}
	
	Mojo.Log.info("Offset = %i",this.offset);
	
	this.printGraph();
}

GraphAssistant.prototype.printGraph = function(){
	this.d = [];
	Mojo.Log.info("Graph type = ",this.model.value);
	
	this.getPlotPoints(this.state.drinks);

	if(this.state.bac == 0){
		Mojo.Log.info("Need to try to add zero point at the end");
		this.addZeroPoint();
	}
	
	//set a plot point for the current state
	this.d.push([new Date().getTime() + this.offset,this.state.bac]);
	
	this.changeGraphType();
}

GraphAssistant.prototype.changeGraphType = function(){
	if(this.model.value == "all"){
		Mojo.Log.info("Plotting all");
		$.plot($("#placeholder"), [this.d], {
			xaxis: { mode: "time" },
			lines: { show: true },
			points: { show: true }
		});
	}else if(this.model.value == "24h"){
		Mojo.Log.info("Plotting 24h");
		$.plot($("#placeholder"), [this.d], {
			xaxis: {
				mode: "time",
				min: new Date().getTime() - 86400000 + this.offset,
			},
			lines: { show: true },
			points: { show: true }
		});
	}else if(this.model.value == "12h"){
		Mojo.Log.info("Plotting 12h");
		$.plot($("#placeholder"), [this.d], {
			xaxis: {
				mode: "time",
				min: new Date().getTime() - 43200000 + this.offset,
			},
			lines: { show: true },
			points: { show: true }
		});
	}
}

GraphAssistant.prototype.getPlotPoints = function(drinks, days){
	for(var i = drinks.length - 1;i>=0;i--){
		var drink = drinks[i];
		if(drink.bacWhenAdded == 0){
			Mojo.Log.info("Need to try to add zero point before ",drink.name);
			this.addZeroPoint();
		}
		this.d.push([drink.time + this.offset, drink.bacWhenAdded]);
		this.d.push([drink.time + 1000 + this.offset, drink.bacWhenAdded + drink.origBac]);
	}
}

GraphAssistant.prototype.addZeroPoint = function(){
	if(this.d.length > 0){
		var lastDrinkTime = this.d[this.d.length-1][0];
		var lastDrinkBac = this.d[this.d.length-1][1];
		var timeToZero = this.bacUtils.calcTimeTo(this.d[this.d.length -1][1],0,true);
		Mojo.Log.info("Time to zero since last drink (in minutes) is ",timeToZero);
		timeToZero = timeToZero * 60 * 1000;
		var zeroTime = lastDrinkTime + timeToZero;
		Mojo.Log.info("zero time point is at ",zeroTime);
		this.d.push([zeroTime, 0]);
	}else{
		Mojo.Log.info("d is empty:",this.d);
	}
}

GraphAssistant.prototype.deactivate = function(){
	Mojo.Log.info("Clearing graph event listeners");
	Mojo.Event.stopListening(this.graphSelector, Mojo.Event.propertyChange, this.changeGraphHandler);
}