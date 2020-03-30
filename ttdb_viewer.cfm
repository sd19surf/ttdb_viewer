<cfinclude template="ttdb_config.cfm">

<cfoutput>
	<style>
	##map {
		height: 85%;
		z-index: 0;
	}
	</style>

	<body>
<div id="map"></div>

	</body>

</cfoutput>
<script>
	var sites = <cfoutput>#serializeJSON(sitesJSON)#</cfoutput>;
</script>

<script src="./js/main.js"></script>
