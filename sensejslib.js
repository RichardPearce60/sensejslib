/* 
    Sense js Library V1.0.0

    JSDocs standard for notation
    prefix: 
        data
        find
        convert
*/

define( [], function () {
	'use strict';

    /**
     * Converts Qlik layout Hypercube to O (original) dataset
     * @param {*} layout - Qlik Sense Layout Object
     * @returns {array} Array - Array of all the data matrix index and values
     */
    function dataMapO (layout){
        let retVal = [], fieldVal = {};     
        layout.qHyperCube.qDataPages[0].qMatrix.forEach((row, i)=>{    
            row.forEach((field, i) => {
                let fieldname = 'i' + i;
                let fieldValue = field.qNum 
                if(fieldValue == 'NaN') {fieldValue = field.qText} 
                fieldVal = Object.assign(fieldVal,{[fieldname]: fieldValue})
            })
            retVal.push(fieldVal)
            fieldVal = {};
        })
        return retVal;
    }

    /**
     * Determins which index's have values
     * @param {array} names N or X array
     * @param {array} values V array
     * @returns 
     */
    function dataMapI (names, values) {
        return d3.range(names.length).filter(i => !isNaN(values[i]));
    }

    /**
     * Map data to new array using accessor (a)
     * @param {*} data (data.o)
     * @param {*} accessor ie d => d.[0]
     * @returns {array}
     */
    function dataMap_(data, a){ return data.map(a) }

    /**
     * Index of all dimension / measure labels
     * @param {*} layout - Qlik Sense Layout Object
     * @returns {array} Array
     */
    function dataMapNames (layout){
        let retVal = []
        layout.qHyperCube.qDimensionInfo.forEach((d)=> retVal.push(d.qGroupFieldDefs[0]))
        layout.qHyperCube.qMeasureInfo.forEach((d)=> retVal.push(d.qFallbackTitle))   
        return retVal;
    }


    /**
     * Groupby and sum array
     * @param {array} data 
     * @param {string} gf Group by Field 
     * @param {string} sf0 Sum Field 0 
     * @returns {array}
     */

    function dataGroupBy (data, gf, sf_a = {}) {
        var retVal = [];
        data.reduce(function (res, value) {
            if (!res[value[gf]]) {
                res[value[gf]] = {   
                    Id: value[gf],
                    [sf_a]: 0
                };
                retVal.push(res[value[gf]])
            }
            res[value[gf]][sf_a] += value[sf_a]
            return res;
        }, {});

        return retVal;
    }

    
    /**
     * Converts distinct field values into csv
     * @param field - Qlik Sense fieldname
     * @returns {string} string - "field A, field B, field C" 
     */
    function convertFieldValueCSV (field){ 
        let retVal = ''
        for (let i = 0; i<field.length; i++){
            retVal = retVal + field[i].qFallbackTitle + ', '
        }
        return retVal.substring(0, retVal.length -2);
    }

 
    /**
     * Takes a date number (ISO) and converts into a JavaScript date
     * @param {!number} serial - iso serial number
     * @returns {date} date - javascript data
     */
    function convertExcelISOToJSDate(serial) {  // Try and find a good date library!
        var utc_days  = Math.floor(serial - 25569);
        var utc_value = utc_days * 86400;                                        
        var date_info = new Date(utc_value * 1000); 
        var fractional_day = serial - Math.floor(serial) + 0.0000001;
        var total_seconds = Math.floor(86400 * fractional_day);
        var seconds = total_seconds % 60;
        total_seconds -= seconds;
        var hours = Math.floor(total_seconds / (60 * 60));
        var minutes = Math.floor(total_seconds / 60) % 60;
        return new Date(date_info.getFullYear(), date_info.getMonth(), date_info.getDate(), hours, minutes, seconds);
     }


    /**
     * Checks an array of numbers and returns the closest value to the Target
     * @param {Array.<number>} array - numbers only
     * @param {number} target - value to find closest match
     * @returns {number} value = closest value found
     */
    function findClosestValue(arr,target){
        let curr = arr[0];
        let diff = Math.abs (target - curr);
        for (var val = 0; val < arr.length; val++) {
        var newdiff = Math.abs (target - arr[val]);
        if (newdiff < diff) {
            diff = newdiff;
            curr = arr[val];
        }
        }
        return curr; // Value
    }



    return {
        convertFieldValueCSV,
        convertExcelISOToJSDate,
        findClosestValue,
        dataMapO,
        dataMapI,
        dataMap_,
        dataMapNames,
        dataGroupBy
    };
   
});