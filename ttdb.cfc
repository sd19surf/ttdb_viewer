<!---Component for all queries and functions needed for the TTDB Viewer--->

<cfcomponent displayName="ttdb_viewer functions" hint="houses all functions for the ttdb viewer">

<cffunction name="selectSites" access="public" output="no" returntype="query">
    <cfargument name="displayType" required="false" default="all" />

    <cfquery name="getSites" datasource="#request.datasource#">
        SELECT ICAO, TAF, SITE_NAME, MAP_LAT, MAP_LON
        FROM #request.web_table#.SITE_CONFIGURATION
        WHERE ACTIVE = <cfqueryparam value='1' cfsqltype="cf_sql_numeric"> AND
        MAP_LAT IS NOT NULL AND
        MAP_LON IS NOT NULL
    </cfquery>


    <cfreturn getSites>
</cffunction>







</cfcomponent>