window.DEBUG = false;
window.FORECAST_DURATION = 120;
window.FORECAST_INTERVAL = 3;
window.refTime = null;

    var displayDate = closestThreeHour(new Date());
	
	baseMapESRI = L.esri.basemapLayer('ShadedRelief');
	baseMapESRILabels = L.esri.basemapLayer('ShadedReliefLabels');
	//Create objects that will be used as layers on the map
	var marker = new L.Marker(),
		markers = [new L.Marker()],
		markersLayer = new L.LayerGroup(),
        currentFeatureGroup;
        
        ThreatAssessment = L.geoJson(null, {
    filter: function(feature, layer){
        return (feature.properties.unknown != 9999 && feature.properties.unknown != 0);
    },
    onEachFeature: function (feature, layer) {
						//add some css or html styling to improve the UX/UI
						 var popTemplate = '<h4><b>'+getFeatureType(feature.properties.type)+'</b></h4>\
							<h5><b>Event Start</b></h5>'
							+feature.properties['startTime'].replace('T', ' @ ') + 'Z\
							<h5><b>Event End</b></h5>'
							+feature.properties['endTime'].replace('T', ' @ ') + 'Z\
							<h5><b>Threat Severity</b></h5>'
							+feature.properties['priority'].toUpperCase()+'\
							<h5><b>Details</b></h5>'
							+feature.properties['description']+'\
							<h5><b>Sites Affected</b></h5>'
							+feature.properties['sites'];
			layer.bindPopup(popTemplate, {maxWidth: 500, minWidth: 300, maxHeight: 500, autoPan: true});
		                   layer.bindTooltip(getFeatureType(feature.properties['type']));
                    
    },
    style: function(feature){
            return feature.properties.style;
        
    },
    classname: "threats"
});
    
    var threatAssess =  L.timeDimension.layer.threatAssessment(ThreatAssessment, {

				});
				

		
	//Create the map

	var obMap = L.map('map', {
		attributionControl: false,
		renderer: L.canvas(),
		preferCanvas: true,
		minZoom: 3,
		maxZoom: 16,		
		maxBounds: [[-90,-360],[90,360]],
		worldCopyJump: true,
		timeDimension: true,
		timeDimensionOptions: {
            
            timeInterval: displayDate.toISOString()+'/'+addDays(displayDate,5).toISOString(),
            period: "PT3H",
                loadingTimeout: 5000,
                loop: true
		},
		timeDimensionControl: true,
		timeDimensionControlOptions: {
            position: "bottomright",
            timeSliderDragUpdate: true,
                playerOptions: {
                  buffer:1,
                  minBufferReady: -1
                },
			backwardButton: true,
			forwardButton: true,
			playButton: true,
			timeSlider: true,
			speedSlider: true
		},
        layers:[baseMapESRI, baseMapESRILabels, threatAssess]
        
    });

    
    //bring in the sites and color them and name them and add them to a group

    sites['DATA'].forEach(function(item){
        if (item[1] == 1){
        var marker = L.circleMarker([item[3], item[4]], {radius: 3, color: "red", fillColor: "white", fillOpacity: 1}).bindTooltip(item[0]+"<br>"+item[2]).addTo(markersLayer);	
        }else{
        var marker = L.circleMarker([item[3], item[4]], {radius: 3, color: "blue", fillColor: "white", fillOpacity: 1}).bindTooltip(item[0]+"<br>"+item[2]).addTo(markersLayer);
        }
    });

    obMap.setView([37, 56], 5);
	obMap.createPane('bounds');
	obMap.getPane('bounds').style.zIndex = 399;
	
	var jsonBoundaries = new L.GeoJSON.AJAX('aor.geojson', {
		style: function(feature) {
			var myStyle = {
				"color": "#000000",
				"weight": 3,
				"opacity": 1,
				"fillOpacity": 0.5
			};
			switch (feature.properties.name) {
				case '15 OWS':
					myStyle['fillColor'] = "#ffff99";
					return myStyle;
					break;
				case '17 OWS':
					myStyle['fillColor'] = "#b9cde5";
					return myStyle;
					break;
				case '21 OWS':
					myStyle['fillColor'] = "#f5e3e3";
					return myStyle;
					break;
				case '25 OWS':
					myStyle['fillColor'] = "#e59a97";
					return myStyle;
					break;
				case '26 OWS':
					myStyle['fillColor'] = "#c6acd9";
					return myStyle;
					break;
				case '28 OWS':
					myStyle['fillColor'] = "#ffd966";
					return myStyle;
			}
		},
		pane: 'bounds'
    });

    var baseMaps = {

    }

    var overlays = {
        "AORS" : jsonBoundaries,
        "Sites": markersLayer
    };

    L.control.layers(baseMaps,overlays,'').addTo(obMap);

 
	function getFeatureType(type) {
		if (type === 'tornado')
			threatType = '<i class="wi wi-tornado"></i> Tornado';
		if (type === 'svrtstm')
                threatType = '<i class="wi wi-thunderstorm"></i> Severe Thunderstorms';
		if (type === 'mdttstm')
                threatType = '<i class="wi wi-thunderstorm"></i> Moderate Thunderstorms';
		if (type === 'fzprecip')
                threatType = '<i class="wi wi-rain-mix"></i> Freezing Precipitation';
		if (type === 'blizzard')
                threatType = '<i class="wi wi-snow-wind"></i><i class="wi wi-windy"></i> Blizzard/Winter Storm';
		if (type === 'heavyrain')
                threatType = '<i class="wi wi-rain"></i> Heavy Rain';
		if (type === 'nonconwind50')
                threatType = '<i class="wi wi-strong-wind"></i> Non-Convective Winds GTE 50kt';
		if (type === 'nonconwind35')
                threatType = '<i class="wi wi-strong-wind"></i> Non-Convective Winds GTE 35kt';
		if (type === 'dust')
                threatType = '<i class="wi wi-dust"></i> Dust';
		if (type === 'cavnotok')
                threatType = '<i class="wi wi-fog"></i> Unsuitable Alternate - CIG/VIS < 1000/2';
		if (type === 'tropical')
                threatType = '<i class="wi wi-hurricane"></i> Significant Tropical';
		return threatType;
	}	


	$(document).ready(function() {
		//For the first modal that appears when a new object is going to be drawn
		$('#modalForm').submit(function(event) {
			event.preventDefault();
			startTime = $('#startDate').val();
			endTime = $('#endDate').val();
			threatLevel = $('#threatLevel').val();
			threatDescription = $('#threatDescription').val();
			$('#threatModal').modal("hide");
		});
		
		$(".btn-group > .btn").click(function(){
			$(this).addClass("active").siblings().removeClass("active");
		});
		
    })
    
  function addDays(date, days) {
    date.setDate(date.getDate() + days);
    return date;
	}
	
function closestThreeHour(date) {
var offset = 3;

if((date.getUTCHours() % offset) != 0){
	date.setHours((date.getHours()-(date.getHours() % offset)) + offset);
}else{
	date.setHours(date.getHours()-(date.getHours() % offset));
}
date.setMinutes(0);
date.setSeconds(0);

return date;
}

function closestHour(epochTime){
    // keeps the display hour to the closest 3 hr time interval
    // 10800 is 3 hours 
var offset = 10800;
    
    if((epochTime % offset) > (offset)){
        return(epochTime - (epochTime % offset)) + offset;
    }else{
        return epochTime - (epochTime % offset);
    }        
}