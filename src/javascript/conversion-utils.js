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
function ConversionUtils() {
}

/*
 * Volume (Technically oz is weight)
 */
ConversionUtils.prototype.ozToMl = function(oz){
	return this.round(29.5735296 * oz);
}
ConversionUtils.prototype.mlToOz = function(ml){
	return this.round(0.0338140227 * ml);
}

/*
 * Weight (Technically kg is mass)
 */
ConversionUtils.prototype.lbsToKg = function(lbs){
	//0.45359237
	return this.round(0.4536 * lbs);
}
ConversionUtils.prototype.kgToLbs = function(kg){
	//2.20462262
	return this.round(2.2046 * kg); 
}

/*
 * Height
 */
ConversionUtils.prototype.inToCm = function(inches){
	return this.round(2.54 * inches);
}
ConversionUtils.prototype.cmToIn = function(cm){
	//0.393700787
	return this.round(0.3937 * cm);
}

ConversionUtils.prototype.round = function(unrounded){
	return Math.round(unrounded * 10) / 10;
}