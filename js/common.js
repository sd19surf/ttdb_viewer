// Global variables
window.DEBUG = false;
window.FORECAST_DURATION = 120;
window.FORECAST_INTERVAL = 3;
window.refTime = null;
//window.version = '2.0.1';
window.manifest = null;
window.AOR = null;

// Determine the url root to be used in building urls throughout JOAF. (can't use localhost b/c of CORS)
let data_root = 'https://ows.sc.afcent.af.mil/joaf_data/';
let server_root = location.href.replace(/[^/]*$/, '');
let cube_rest_url = 'https://ows.sc.afcent.af.mil/services/datacube.cfc?';
let obs_tafs_url = 'https://ows.sc.afcent.af.mil/services/site.cfc?';

// setup a class for AORs
/*class AOR {
    constructor(name, bounds, areas, pane){
        this.name = name;
        this.areas = areas;
        this.bounds = bounds;
        this.style_aor = { color: "#666", fillColor: "#d2b48c", "weight": 0.5, "fillOpacity": 1.0, "opacity": 1.0 };
        this.style_non_aor = { color: "#666", fillColor: "#ddd", "weight": 0.5, "fillOpacity": 1.0, "opacity": 1.0 };

        this.map = L.geoJSON(worldMap, {
            style: function(feature){
                if (areas.includes(feature.properties.gu_a3)) {
                    return this.style_aor;
                } else {
                    return this.style_non_aor;
                }
            }.bind(this),
            pane: pane,
            noWrap: 'false',
            attribution: this.name + " Map (LB)",
        });
    }
    setView(map) {
        let center_lat = (this.bounds[1][0] + this.bounds[0][0]) / 2.0;
        let center_lon = (this.bounds[0][1] + this.bounds[1][1]) / 2.0;
        map.flyTo([center_lat, center_lon], 2);
        map.setMaxBounds(this.bounds);
    }
}*/
if (!String.prototype.padStart) {
    String.prototype.padStart = function padStart(targetLength,padString) {
        targetLength = targetLength>>0; //truncate if number or convert non-number to 0;
        padString = String((typeof padString !== 'undefined' ? padString : ' '));
        if (this.length > targetLength) {
            return String(this);
        }
        else {
            targetLength = targetLength-this.length;
            if (targetLength > padString.length) {
                padString += padString.repeat(targetLength/padString.length); //append to original to ensure we are longer than needed
            }
            return padString.slice(0,targetLength) + String(this);
        }
    };
}

function zeroPad(s, l) {
	return String(s).padStart(l, '0');
}

function getDateTimeString(time) {
	var d = new Date(time);
    return d.getUTCFullYear() + zeroPad(d.getUTCMonth()+1, 2) + zeroPad(d.getUTCDate(), 2) + zeroPad(d.getUTCHours(), 2) + zeroPad(d.getUTCMinutes(), 2);
}

function getUrl() {
	return encodeURI(Array.prototype.join.call(arguments, '/'));
}

/*function takeScreenshot() {
    html2canvas(document.querySelector("#map")).then(canvas => {
        var screenshot = document.createElement('a');
        screenshot.href = canvas.toDataURL();
        screenshot.download = "JOAF-screenshot-" + Date();
        screenshot.click();
    });
}*/

function downloadFile(url, type, callback, e_callback) {
 e_callback = null;
	var request = $.ajax({
		type: 'GET',
		url: url,
		dataType: type,
		success: callback,
		error: (function(xhr, textStatus, err) {
			if (e_callback !== null) {
				e_callback(xhr);
			}
			else { 
				alert("Error while retrieving file: " + url);
			}
		})
	})

	return request;
}

function downloadPrefixFile(url, type, callback, e_callback) {
	e_callback = null;
	var request = $.ajax({
		type: 'GET',
		url: url,
		dataType: type,
        dataFilter: function(data, type){return data.substr(2)},
		success: callback,
		error: function(xhr, textStatus, err) {
			if (e_callback !== null) {
				e_callback(xhr);
			}
			else { 
				alert("Error while retrieving file: " + url);
			}
		}
	});

	return request;
}

function convertEpochToStandardwithOffset(timeStamp, offset){
    //added url padding for some safety
    var date = new Date(timeStamp + offset);
    var year = date.getUTCFullYear();
    var month = date.getUTCMonth() + 1;
    var day = date.getUTCDate();
    var hours = date.getUTCHours();
    var minutes = date.getUTCMinutes();
    var seconds = date.getUTCSeconds();
    
    return year + "/" + addZeroPad(month) + "/" + addZeroPad(day) + "%20" + addZeroPad(hours) + ":" + addZeroPad(minutes) + ":" + addZeroPad(seconds);
}

function addZeroPad(number){
    if (number < 10){
        number = "0" + number;
    }
 return number;
}

function xmlToJson(xml) {

	// Create the return object
	var obj = {};

	if (xml.nodeType == 1) { // element
		// do attributes
		if (xml.attributes.length > 0) {
		obj["@attributes"] = {};
			for (var j = 0; j < xml.attributes.length; j++) {
				var attribute = xml.attributes.item(j);
				obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
			}
		}
	} else if (xml.nodeType == 3) { // text
		obj = xml.nodeValue;
	}

	// do children
	// If just one text node inside
	if (xml.hasChildNodes() && xml.childNodes.length === 1 && xml.childNodes[0].nodeType === 3) {
		obj = xml.childNodes[0].nodeValue;
	}
	else if (xml.hasChildNodes()) {
		for(var i = 0; i < xml.childNodes.length; i++) {
			var item = xml.childNodes.item(i);
			var nodeName = item.nodeName;
			if (typeof(obj[nodeName]) == "undefined") {
				obj[nodeName] = xmlToJson(item);
			} else {
				if (typeof(obj[nodeName].push) == "undefined") {
					var old = obj[nodeName];
					obj[nodeName] = [];
					obj[nodeName].push(old);
				}
				obj[nodeName].push(xmlToJson(item));
			}
		}
	}
	return obj;
}

function avg(arr, round) {
	var sum = 0;
	for (var i = 0; i < arr.length; i++){
		sum += arr[i];
	}
	var a = sum / arr.length;
	if (round) {
		sum = Math.round(sum);
	}
	return sum;
}

