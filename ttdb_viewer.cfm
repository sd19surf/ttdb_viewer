<cfinclude template="ttdb_config.cfm">

<cfoutput>

	<body>
		<div class="row">
			<div class="col-md-3" id="threats" style='border: 1px solid black'>
			  <h2>List of Threats:</h2>
			</div>
		
			<div class="col-md-9">
			  <div id="map"></div>
			</div>
		  </div>
	</body>

</cfoutput>
<script>
	var sites = {"DATA":[]};
</script>

<script src="./js/main.js"></script>
