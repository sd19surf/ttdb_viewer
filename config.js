/**
 * @sendReceive
 * The URL for backend CFC; change to local URL.
 *
 * @sourceOWS
 * Set the originating OWS -- change to local OWS number
 *
 * @localForecastHour
 * Set the hour for local TTDB production.
 *
 * @prefixFilter
 * By default config, CF will prefix two solidus to returned JSON payloads
 * If the CF setting to add a prefix to JSON payloads is enabled, change the prefixFilter to true
 * If the CF setting to add a prefix to JSON payloads is enabled, change the prefixFilter to false 
 *
 * @prefixFilterCount
 * If the CF JSON prefix is enabled but not a two character prefix, change this to the character count of the prefix
 *
 * @initCoords
 * Where the map will center on first load
 *
 * @initZoom
 * Zoom level when map first loads
 *
 * @wmsOptions
 * A string to declare vars for later use with AFW-WEBS WMS -- NOT IN USE
 *
 * @afwProxyURL
 * URL to a M2M interface between the 26 OWS Intranet to the AFW-WEBS WMS
**/
var CFG = {
	"sendReceive": "https://26ows.us.af.mil/product/map/ttdb/ttdb_snr.cfc",
	"owsPatch": "/styles/images/28ows.png",
	"sourceOWS": 28,
	"localForecastHour": 12,
	"useEnsembles": false,
	"prefixFilter": false,
	"prefixFilterCount": 2,
	"initCoords": [32.50182, -93.662674],
	"initZoom": 5,
	"wmsOptions": "{'identify':false,'format':'image/png','styles':'default','transparent':'TRUE','crs':L.CRS.EPSG4326,'version':'1.3.0'}",
	"afwProxyURL": "https://awub-wxw-101p.area52.afnoapps.usaf.mil/intranet/afwebproxy.cfm?proxyurl=https://gisweather.afwa.af.mil/services/WMS?"
}