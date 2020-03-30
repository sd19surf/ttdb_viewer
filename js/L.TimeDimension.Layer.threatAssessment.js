L.TimeDimension.Layer.threatAssessment = L.TimeDimension.Layer.extend({

    initialize: function(layer, options) {
        L.TimeDimension.Layer.prototype.initialize.call(this, layer, options);
        this._currentLoadedTime = 0;
        this._currentTimeData = null;
        this._cache = {};
        this._period = this.options.period || "P3H";
        // Array to keep track of times that may be currently downloading. Necessary because a time could begin
        // downloading and while downloading the time control is manipulated to fire another request to download.
        this._downloading = [];
    },

    onAdd: function(map) {
        L.TimeDimension.Layer.prototype.onAdd.call(this, map);
        if (this._timeDimension) {
            this._getDataForTime(this._timeDimension.getCurrentTime());
        }
       // document.getElementsByClassName('info legend ' + this._currentLayer.options.classname)[0].setAttribute("style","visibility: show;");
    },

    eachLayer: function(method, context) {
        if (this._currentLayer) {
            method.call(context, this._currentLayer);
        }
        return L.TimeDimension.Layer.prototype.eachLayer.call(this, method, context);
    },

    _onNewTimeLoading: function(ev) {
        this._getDataForTime(ev.time);
        return;
    },

    isLoading: function () {
        if (window.DEBUG) {
            console.log('isLoading(): ' + time)
        }
        return (this._loadingTimeIndex !== -1);
    },

    isReady: function(time) {
        if (window.DEBUG) {
            console.log('isReady(): ' + time)
        }
       return (this._currentLoadedTime == time);
       //return (time in this._cache)
    },

    getLayerName: function() {
        return this.options.layerName;
    },

    getFileUrl: function() {
        return this.options.file_url;
    },

    _update: function() {
        if (!this._map)
            return;
        var layer = L.geoJson(this._currentTimeData, this._baseLayer.options);
        if (this._currentLayer) {
            this._map.removeLayer(this._currentLayer);
        }
        layer.addTo(this._map);
        this._currentLayer = layer;
    },
    
     _getFeatureTimes: function(feature) {
        if (!feature.properties) {
            return [];
        }
        if (feature.properties.hasOwnProperty('coordTimes')) {
            return feature.properties.coordTimes;
        }
        if (feature.properties.hasOwnProperty('times')) {
            return feature.properties.times;
        }
        if (feature.properties.hasOwnProperty('linestringTimestamps')) {
            return feature.properties.linestringTimestamps;
        }
        if (feature.properties.hasOwnProperty('time')) {
            return [feature.properties.time * 1000];
        }
        return [];
    },   
    
        // Do not modify features. Just return the feature if it intersects
    // the time interval
    _getFeatureBetweenDates: function(feature, minTime, maxTime) {
        var featureStringTimes = this._getFeatureTimes(feature);
        if (featureStringTimes.length == 0) {
            return feature;
        }
        var featureTimes = [];
        for (var i = 0, l = featureStringTimes.length; i < l; i++) {
            var time = featureStringTimes[i]
            if (typeof time == 'string' || time instanceof String) {
                time = Date.parse(time.trim());
            }
            featureTimes.push(time);
        }

        if (featureTimes[0] > maxTime || featureTimes[l - 1] < minTime) {
            return null;
        }
        return feature;
    },

    _getDataForTime: function(time) {
        console.log(this._downloading)
        if (!this._map || this._downloading.includes(time)) {
            console.log('Stopped attempt to load data due to already downloading data or missing map for time: ' + time)
            return;
        }
        let timestring = getDateTimeString(time);
        var success = function(data) {
            this._currentTimeData = data;
            this._cache[time] = data;
            this._updateTime(time);
            // remove the loading animation
            L.DomUtil.removeClass(this._map.timeDimensionControl._displayDate, 'loading');
            // remove the time from the currently downloading array
            this._downloading.splice(this._downloading.indexOf(time), 1);
        };
        var fail = function(reason) {
            console.log('in fail');
            console.log(reason);           
            this._currentTimeData = [];
            this._updateTime(time);
            // remove the loading animation
            L.DomUtil.removeClass(this._map.timeDimensionControl._displayDate, 'loading');
            // remove the time from the currently downloading array
            this._downloading.splice(this._downloading.indexOf(time), 1);
        };
        var url;
        if (!(time in this._cache)) {
            //change all of this to grab the json file from the database
            let startTime = convertEpochToStandardwithOffset(time, 0);
            let endTime = convertEpochToStandardwithOffset(time, 10800000); //3hrs
            
            try {
                var filename = undefined
               
                    url = "https://ows.sc.afcent.af.mil/product/map/ttdb/ttdb_snr.cfc?method=retrieveGeoJSON&startDateTime=" + startTime + "&endDateTime=" + endTime + "&returnFormat=json"
                   // url = "./test.json";
            } catch (err) {
                console.log('No entry in database: ' + [[this.options.type],[window.AOR],[this.options.symbol],[window.refTime],[this.options.level],[time_s]].join('-'));
                this.attribution = "Unavailable";
                return
            }
            if(!url){
                console.log("No geo json to retrieve. " + [[this.options.type],[window.AOR],[this.options.symbol],[window.refTime],[this.options.level],[time_s]].join('-'))
                return
            }
            console.log(url)

            if (window.DEBUG) {
                console.log('downloading: ' + url);
            }
            // load data from jsons returned
            try {
                if (this._downloading.indexOf(time)){
                    this._downloading.push(time);
                    //shp(url).then(success.bind(this), fail.bind(this));
                    var firstcall = downloadFile(url, 'json', success.bind(this), fail.bind(this))
                   // alert(firstcall.fail)
                    // set the loading animation
                    L.DomUtil.addClass(this._map.timeDimensionControl._displayDate, 'loading');
                }
            } catch (err) {
                console.log(err);
                L.DomUtil.removeClass(this._map.timeDimensionControl._displayDate, 'loading');
                this._downloading.splice(this._downloading.indexOf(time), 1);
            }
        } else {
            // Remove the time from the downloading-in-progress array, since it is finished.
            if (this._downloading.includes(time)) {
                this._downloading.splice(this._downloading.indexOf(time), 1);
            }
            // Using the cache!
            if (window.DEBUG){
                console.log('Using cache for: ' + time);
            }
            this._currentTimeData = this._cache[time];
            this._updateTime(time);
        }
    },

    _updateTime: function(time) {
        this._currentLoadedTime = time;
        if (this._timeDimension && time == this._timeDimension.getCurrentTime() && !this._timeDimension.isLoading()) {
            this._update();
        }
        this.fire('timeload', {
            time: time
        });
    }
});

L.timeDimension.layer.threatAssessment = function(layer, options) {
    return new L.TimeDimension.Layer.threatAssessment(layer, options);
};
