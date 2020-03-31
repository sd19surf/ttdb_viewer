

<cfoutput>
	<head>
		<!---
			Source files		
		--->

		<!---bootstrap needed for modal and pop-ups--->
		<!---comment these three lines out for production--->
		<!---<script src="./js/jquery-3.2.1.min.js"></script>
		<script src="./js/bootstrap.min.js"></script>
		<link href="./css/bootstrap.min.css" rel="stylesheet">--->
		
		<!---Cross browser support--->
		<script src="./js/polyfill.min.js"></script>

		<link href="./css/leaflet.css" rel="stylesheet">
		<link href="./css/leaflet.timedimension.control.min.css" rel="stylesheet">
		<!--- Use latest version of Leaflet and leave current in place to avoid possible errors in other apps due to deprecated code --->
		<script src="./js/leaflet.js"></script>
		<script src="./js/esri-leaflet.js"></script>
		<script src="./js/iso8601.min.js"></script>
		<script src="./js/common.js"></script>
		<script src="./js/leaflet.timedimension.min.js"></script>
		<script src="./js/L.TimeDimension.Layer.threatAssessment.js"></script>
		<script src="./js/leaflet-control.js"></script>
		<script src="./js/leaflet.wms.js"></script>
		<script src="./js/leaflet.ajax.min.js"></script>
	</head>


	 <cfset sites = CreateObject("component","ttdb")>
	 <cfset sitesJSON = sites.selectSites() >
</cfoutput>