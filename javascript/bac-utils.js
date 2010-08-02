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
function BacUtils() {
}

BacUtils.prototype.calcBacIncrease = function(prefs,drink){
	if(prefs.calc == "widmark"){
		return this.calcBacIncreaseWidmark(prefs,drink);
	}else if(prefs.calc == "watson"){
		return this.calcBacIncreaseWatson(prefs, drink);
	}else{
		return this.calcBacIncreaseWidmark(prefs,drink);
	}
}

BacUtils.prototype.calcBacIncreaseWidmark = function(prefs, drink){
	var abv = drink.abv / 100; //convert to percentage
	var a = drink.vol * abv; //the amount of pure alcohol in the drink (in fluid ounces)
	if(prefs.gender == "m"){
		var r = 0.68; //0.58 low - 0.68 mid - 0.9 high
	}else{
		var r = 0.55; //0.45 low - 0.55 mid - 0.63 high
	}
	bacDelta = a /(prefs.weight*r);
	bacDelta = bacDelta * 0.0514; //pounds per fluid ounce
	bacDelta = bacDelta * 1.055; //specific gravity of blood (in grams per milliliter)
	bacDelta = bacDelta * 100; //grams per 100ml--Widmark's preferred units
	return bacDelta;
}

BacUtils.prototype.calcBacIncreaseWatson = function(prefs, drink){
	var a = drink.vol * (drink.abv/100); //ounces of pure alcohol
	a = a * 23.36;//(35/3); //conv to grams
	var tbw = this.calcTbw(prefs);

	//tbw is in liters
	bacDelta = (a * (0.80 / tbw)); //grams per liter
	bacDelta = bacDelta * 100; //grams per 100 milliliter
	bacDelta = bacDelta / 1000; // convert grams to kilograms?
	return bacDelta;
}

BacUtils.prototype.calcTbw = function(prefs){
	var cm = prefs.height * 2.54; //convert inches to cm
	var kg = prefs.weight / 2.2046; //convert lbs to kg
	if(prefs.gender == "m"){
		return 2.447 - (0.09516 * prefs.age) + (0.1074 * cm) + (0.3362 * kg);
	}else{
		return -2.097 + (0.1069 * cm) + (0.2466 * kg);
	}
}

BacUtils.prototype.calcBacDecrease = function(milliseconds){
	var timeDelta = milliseconds / 1000.0 / 60.0 / 60.0; // hours
	var bacDelta = 0.015 * timeDelta;
	Mojo.Log.info("BAC Decrease was %d over %d millis (%d hours)", bacDelta, milliseconds, timeDelta);
	return bacDelta;
}

BacUtils.prototype.calcTimeTo = function(currentBac, targetBac, asInt){
	var bacDelta = currentBac - targetBac;
	if(bacDelta <= 0){
		bacDelta = 0;
	}
	
	var totalMinutes = Math.round(bacDelta / 0.00025);
	if(asInt){
		return totalMinutes;
	}else{
		var hours =	Math.floor(totalMinutes / 60);
		var minutes = totalMinutes % 60;
		
		var timeTo = hours + ":" + minutes;
		
		//Mojo.Log.info("%i = %s",totalMinutes, timeTo);
		return timeTo;
	}
}

BacUtils.prototype.roundBac = function(unrounded){
	return Math.round(unrounded * 10000) / 10000;
}
