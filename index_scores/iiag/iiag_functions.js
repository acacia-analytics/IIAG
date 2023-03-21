//Functions for converting from ALASQL outputs to highcharts-usable formats 
function make_map_dict(records_json3, category3, value3){
	var values = [];
	for(record in records_json3){
		var sub_dict = {};
		sub_dict[category3] = records_json3[record][category3];
		sub_dict['value'] = records_json3[record][value3];
		values.push(sub_dict);
	}
	return values;
}

function make_dict(records_json2, category2, value2){
	var new_dict = {};
	var categories = [];
	var values = [];
	for(record in records_json2){
		categories.push(records_json2[record][category2]);
		values.push(records_json2[record][value2]);
	}
	new_dict[category2] = categories;
	new_dict[value2] = values;
	return new_dict;
}

function make_multi_dict(records_json2, category2, values){
	var new_dict = {};
	var categories = [];
	var values_dict = {};


	for(record in records_json2){
		categories.push(records_json2[record][category2]);
	}
	new_dict[category2] = categories;

	for(v in values){
		values_dict[values[v]] = []
		for(record in records_json2){			
			values_dict[values[v]].push(records_json2[record][values[v]]);
		}
		new_dict[values[v]] = values_dict[values[v]];
	}

	return new_dict;
}

function make_tuples(records_json, category, value){
	new_tuples = []
	for(record in records_json){
		new_tuples.push([records_json[record][category], records_json[record][value]]);
	}
	return new_tuples
}


// Function to pull IIAG data by region 
// This requires if/then statements, because ALASQL is pretty restrive on customizing the columns that you pull from 
// I believe this is to prevent SQL injection queries 
// So we need to use several if/then statements here 

function get_region_data(iiag, Level, Region_Type, category_value, sub_category_value, indicator_value, sub_indicator_value, sub_sub_indicator_value){
	if(Level == 'Level1'){
		if(Region_Type == 'AC_Region'){
		index_results_line_sql = alasql(`SELECT Year, ROUND(AVG(CASE WHEN Region = "Northern Africa" THEN [Value] ELSE NULL END), 2) AS NA_Value, 
			ROUND(AVG(CASE WHEN AC_Region = "Sahel & Lake Chad Basin" THEN [Value] ELSE NULL END), 2) AS Sahel_Value, 
			ROUND(AVG(CASE WHEN AC_Region = "Gulf of Guinea" THEN [Value] ELSE NULL END), 2) AS GG_Value, 
			ROUND(AVG(CASE WHEN AC_Region = "East Africa" THEN [Value] ELSE NULL END), 2) AS EA_Value, 
			ROUND(AVG(CASE WHEN AC_Region = "North Africa" THEN [Value] ELSE NULL END), 2) AS NA_Value, 
			ROUND(AVG(CASE WHEN AC_Region = "South Africa" THEN [Value] ELSE NULL END), 2) AS SA_Value, 
			ROUND(AVG([Value]), 2) AS [Value] FROM ? WHERE Levels = ? GROUP BY Year ORDER BY Year`, [iiag, 'Overall']);

		index_region_trend_sql = alasql(`
			SELECT 
			ROUND(AVG([Change]), 2) AS Change, Region FROM 
				(SELECT SUM(CASE WHEN [Year] == ? THEN [Value] ELSE 0 END - CASE WHEN [Year] == ? THEN [Value] ELSE 0 END) AS [Change], 
				AC_Region AS Region FROM ? WHERE Levels = ? AND AC_Region IS NOT NULL GROUP BY Country, AC_Region) t 
			GROUP BY Region 
			`, [MAX_YEAR, MAX_YEAR_MINUS_DECADE, iiag, 'Overall'])

		} else if(Region_Type == 'AC_Regional_Division'){
		index_results_line_sql = alasql(`SELECT Year, ROUND(AVG(CASE WHEN AC_Regional_Division = "J53" THEN [Value] ELSE NULL END), 2) AS J53_Value, 
			ROUND(AVG(CASE WHEN AC_Regional_Division = "J52" THEN [Value] ELSE NULL END), 2) AS J52_Value, 
			ROUND(AVG(CASE WHEN AC_Regional_Division = "J51" THEN [Value] ELSE NULL END), 2) AS J51_Value, 
			ROUND(AVG([Value]), 2) AS [Value] FROM ? WHERE Levels = ? GROUP BY Year ORDER BY Year`, [iiag, 'Overall']); 

		index_region_trend_sql = alasql(`
			SELECT 
			ROUND(AVG([Change]), 2) AS Change, Region FROM 
				(SELECT SUM(CASE WHEN [Year] == ? THEN [Value] ELSE 0 END - CASE WHEN [Year] == ? THEN [Value] ELSE 0 END) AS [Change], 
				AC_Regional_Division AS Region FROM ? WHERE Levels = ? AND AC_Regional_Division IS NOT NULL GROUP BY Country, AC_Regional_Division) t 
			GROUP BY Region 
			`, [MAX_YEAR, MAX_YEAR_MINUS_DECADE, iiag, 'Overall'])

		} else if(Region_Type == 'UN_Region'){
		index_results_line_sql = alasql(`SELECT Year, ROUND(AVG(CASE WHEN UN_Region = "Central Africa" THEN [Value] ELSE NULL END), 2) AS CA_Value, 
			ROUND(AVG(CASE WHEN UN_Region = "Eastern Africa" THEN [Value] ELSE NULL END), 2) AS EA_Value, 
			ROUND(AVG(CASE WHEN UN_Region = "Northern Africa" THEN [Value] ELSE NULL END), 2) AS NA_Value, 
			ROUND(AVG(CASE WHEN UN_Region = "Western Africa" THEN [Value] ELSE NULL END), 2) AS WA_Value, 
			ROUND(AVG(CASE WHEN UN_Region = "Southern Africa" THEN [Value] ELSE NULL END), 2) AS SA_Value, 
			ROUND(AVG([Value]), 2) AS [Value] FROM ? WHERE Levels = ? GROUP BY Year ORDER BY Year`, [iiag, 'Overall']);

		index_region_trend_sql = alasql(`
			SELECT 
			ROUND(AVG([Change]), 2) AS Change, Region FROM 
				(SELECT SUM(CASE WHEN [Year] == ? THEN [Value] ELSE 0 END - CASE WHEN [Year] == ? THEN [Value] ELSE 0 END) AS [Change], 
				UN_Region AS Region FROM ? WHERE Levels = ? AND UN_Region IS NOT NULL GROUP BY Country, UN_Region) t 
			GROUP BY Region 
			`, [MAX_YEAR, MAX_YEAR_MINUS_DECADE, iiag, 'Overall'])

		} else if(Region_Type == 'AU_Region'){
		index_results_line_sql = alasql(`SELECT Year, ROUND(AVG(CASE WHEN AU_Region = "Central Africa" THEN [Value] ELSE NULL END), 2) AS CA_Value, 
			ROUND(AVG(CASE WHEN AU_Region = "Eastern Africa" THEN [Value] ELSE NULL END), 2) AS EA_Value, 
			ROUND(AVG(CASE WHEN AU_Region = "Northern Africa" THEN [Value] ELSE NULL END), 2) AS NA_Value, 
			ROUND(AVG(CASE WHEN UN_Region = "Western Africa" THEN [Value] ELSE NULL END), 2) AS WA_Value, 			
			ROUND(AVG(CASE WHEN AU_Region = "Southern Africa" THEN [Value] ELSE NULL END), 2) AS SA_Value, 
			ROUND(AVG([Value]), 2) AS [Value] FROM ? WHERE Levels = ? GROUP BY Year ORDER BY Year`, [iiag, 'Overall']);
			
		index_region_trend_sql = alasql(`
			SELECT 
			ROUND(AVG([Change]), 2) AS Change, Region FROM 
				(SELECT SUM(CASE WHEN [Year] == ? THEN [Value] ELSE 0 END - CASE WHEN [Year] == ? THEN [Value] ELSE 0 END) AS [Change], 
				AU_Region AS Region FROM ? WHERE Levels = ? AND AU_Region IS NOT NULL GROUP BY Country, AU_Region) t 
			GROUP BY Region 
			`, [MAX_YEAR, MAX_YEAR_MINUS_DECADE, iiag, 'Overall'])
		}
	} else if(Level == 'Level2'){
		if(Region_Type == 'AC_Region'){
		index_results_line_sql = alasql(`SELECT Year, ROUND(AVG(CASE WHEN AC_Region = "Northern Africa" THEN [Value] ELSE NULL END), 2) AS NA_Value, 
			ROUND(AVG(CASE WHEN AC_Region = "Sahel & Lake Chad Basin" THEN [Value] ELSE NULL END), 2) AS Sahel_Value, 
			ROUND(AVG(CASE WHEN AC_Region = "Gulf of Guinea" THEN [Value] ELSE NULL END), 2) AS GG_Value, 
			ROUND(AVG(CASE WHEN AC_Region = "East Africa" THEN [Value] ELSE NULL END), 2) AS EA_Value, 
			ROUND(AVG(CASE WHEN AC_Region = "North Africa" THEN [Value] ELSE NULL END), 2) AS NA_Value, 
			ROUND(AVG(CASE WHEN AC_Region = "South Africa" THEN [Value] ELSE NULL END), 2) AS SA_Value, 
			ROUND(AVG([Value]), 2) AS [Value] FROM ? WHERE Category = ?  AND Levels = ? GROUP BY Year ORDER BY Year`, [iiag, category_value, 'Category']);

		index_region_trend_sql = alasql(`
			SELECT 
			ROUND(AVG([Change]), 2) AS Change, Region FROM 
				(SELECT SUM(CASE WHEN [Year] == ? THEN [Value] ELSE 0 END - CASE WHEN [Year] == ? THEN [Value] ELSE 0 END) AS [Change], 
				AC_Region AS Region FROM ? WHERE Category = ? AND Levels = ? AND AC_Region IS NOT NULL GROUP BY Country, AC_Region) t 
			GROUP BY Region 
			`, [MAX_YEAR, MAX_YEAR_MINUS_DECADE, iiag, category_value, 'Category'])

		} else if(Region_Type == 'AC_Regional_Division'){

		index_results_line_sql = alasql(`SELECT Year, ROUND(AVG(CASE WHEN AC_Regional_Division = "J53" THEN [Value] ELSE NULL END), 2) AS J53_Value, 
			ROUND(AVG(CASE WHEN AC_Regional_Division = "J52" THEN [Value] ELSE NULL END), 2) AS J52_Value, 
			ROUND(AVG(CASE WHEN AC_Regional_Division = "J51" THEN [Value] ELSE NULL END), 2) AS J51_Value, 
			ROUND(AVG([Value]), 2) AS [Value] FROM ? WHERE Category = ? AND Levels = ? GROUP BY Year ORDER BY Year`, [iiag,  category_value, 'Category']); 
			
		index_region_trend_sql = alasql(`
			SELECT 
			ROUND(AVG([Change]), 2) AS Change, Region FROM 
				(SELECT SUM(CASE WHEN [Year] == ? THEN [Value] ELSE 0 END - CASE WHEN [Year] == ? THEN [Value] ELSE 0 END) AS [Change], 
				AC_Regional_Division AS Region FROM ? WHERE Category = ? AND Levels = ? AND AC_Regional_Division IS NOT NULL GROUP BY Country, AC_Regional_Division) t 
			GROUP BY Region 
			`, [MAX_YEAR, MAX_YEAR_MINUS_DECADE, iiag, category_value, 'Category'])
		
		} else if(Region_Type == 'UN_Region'){
		index_results_line_sql = alasql(`SELECT Year, ROUND(AVG(CASE WHEN UN_Region = "Central Africa" THEN [Value] ELSE NULL END), 2) AS CA_Value, 
			ROUND(AVG(CASE WHEN UN_Region = "Eastern Africa" THEN [Value] ELSE NULL END), 2) AS EA_Value, 
			ROUND(AVG(CASE WHEN UN_Region = "Northern Africa" THEN [Value] ELSE NULL END), 2) AS NA_Value, 
			ROUND(AVG(CASE WHEN UN_Region = "Western Africa" THEN [Value] ELSE NULL END), 2) AS WA_Value, 
			ROUND(AVG(CASE WHEN UN_Region = "Southern Africa" THEN [Value] ELSE NULL END), 2) AS SA_Value, 
			ROUND(AVG([Value]), 2) AS [Value] FROM ? WHERE Category = ? AND Levels = ? GROUP BY Year ORDER BY Year`, [iiag,  category_value, 'Category']);

		index_region_trend_sql = alasql(`
			SELECT 
			ROUND(AVG([Change]), 2) AS Change, Region FROM 
				(SELECT SUM(CASE WHEN [Year] == ? THEN [Value] ELSE 0 END - CASE WHEN [Year] == ? THEN [Value] ELSE 0 END) AS [Change], 
				UN_Region AS Region FROM ? WHERE Category = ? AND Levels = ? AND UN_Region IS NOT NULL GROUP BY Country, UN_Region) t 
			GROUP BY Region 
			`, [MAX_YEAR, MAX_YEAR_MINUS_DECADE, iiag, category_value, 'Category'])

		} else if(Region_Type == 'AU_Region'){
		index_results_line_sql = alasql(`SELECT Year, ROUND(AVG(CASE WHEN AU_Region = "Central Africa" THEN [Value] ELSE NULL END), 2) AS CA_Value, 
			ROUND(AVG(CASE WHEN AU_Region = "Eastern Africa" THEN [Value] ELSE NULL END), 2) AS EA_Value, 
			ROUND(AVG(CASE WHEN AU_Region = "Northern Africa" THEN [Value] ELSE NULL END), 2) AS NA_Value, 
			ROUND(AVG(CASE WHEN AU_Region = "Western Africa" THEN [Value] ELSE NULL END), 2) AS WA_Value, 			
			ROUND(AVG(CASE WHEN AU_Region = "Southern Africa" THEN [Value] ELSE NULL END), 2) AS SA_Value, 
			ROUND(AVG([Value]), 2) AS [Value] FROM ? WHERE Category = ? AND Levels = ? GROUP BY Year ORDER BY Year`, [iiag,  category_value, 'Category']);

		index_region_trend_sql = alasql(`
			SELECT 
			ROUND(AVG([Change]), 2) AS Change, Region FROM 
				(SELECT SUM(CASE WHEN [Year] == ? THEN [Value] ELSE 0 END - CASE WHEN [Year] == ? THEN [Value] ELSE 0 END) AS [Change], 
				AU_Region AS Region FROM ? WHERE Category = ? AND Levels = ? AND AU_Region IS NOT NULL GROUP BY Country, AU_Region) t 
			GROUP BY Region 
			`, [MAX_YEAR, MAX_YEAR_MINUS_DECADE, iiag, category_value, 'Category'])
		}

	} else if(Level == 'Level3'){
		if(Region_Type == 'AC_Region'){
			index_results_line_sql = alasql(`SELECT Year, ROUND(AVG(CASE WHEN AC_Region = "Northern Africa" THEN [Value] ELSE NULL END), 2) AS NA_Value, 
				ROUND(AVG(CASE WHEN AC_Region = "Sahel & Lake Chad Basin" THEN [Value] ELSE NULL END), 2) AS Sahel_Value, 
				ROUND(AVG(CASE WHEN AC_Region = "Gulf of Guinea" THEN [Value] ELSE NULL END), 2) AS GG_Value, 
				ROUND(AVG(CASE WHEN AC_Region = "East Africa" THEN [Value] ELSE NULL END), 2) AS EA_Value, 
				ROUND(AVG(CASE WHEN AC_Region = "North Africa" THEN [Value] ELSE NULL END), 2) AS NA_Value, 
				ROUND(AVG(CASE WHEN AC_Region = "South Africa" THEN [Value] ELSE NULL END), 2) AS SA_Value, 
				ROUND(AVG([Value]), 2) AS [Value] FROM ? WHERE Category = ? AND Sub_Category = ? AND Levels = ? GROUP BY Year ORDER BY Year`, [iiag, category_value, sub_category_value, 'Sub-category']);
				
		index_region_trend_sql = alasql(`
			SELECT 
			ROUND(AVG([Change]), 2) AS Change, Region FROM 
				(SELECT SUM(CASE WHEN [Year] == ? THEN [Value] ELSE 0 END - CASE WHEN [Year] == ? THEN [Value] ELSE 0 END) AS [Change], 
				AC_Region AS Region FROM ? WHERE Category = ? AND Sub_Category = ? AND Levels = ? AND AC_Region IS NOT NULL GROUP BY Country, AC_Region) t 
			GROUP BY Region 
			`, [MAX_YEAR, MAX_YEAR_MINUS_DECADE, iiag, category_value, sub_category_value, 'Sub-category'])

		} else if(Region_Type == 'AC_Regional_Division'){
			index_results_line_sql = alasql(`SELECT Year, ROUND(AVG(CASE WHEN AC_Regional_Division = "J53" THEN [Value] ELSE NULL END), 2) AS J53_Value, 
				ROUND(AVG(CASE WHEN AC_Regional_Division = "J52" THEN [Value] ELSE NULL END), 2) AS J52_Value, 
				ROUND(AVG(CASE WHEN AC_Regional_Division = "J51" THEN [Value] ELSE NULL END), 2) AS J51_Value, 
				ROUND(AVG([Value]), 2) AS [Value] FROM ? WHERE Category = ? AND Sub_Category = ? AND Levels = ? GROUP BY Year ORDER BY Year`, [iiag,  category_value, sub_category_value, 'Sub-category']); 

		index_region_trend_sql = alasql(`
			SELECT 
			ROUND(AVG([Change]), 2) AS Change, Region FROM 
				(SELECT SUM(CASE WHEN [Year] == ? THEN [Value] ELSE 0 END - CASE WHEN [Year] == ? THEN [Value] ELSE 0 END) AS [Change], 
				AC_Regional_Division AS Region FROM ? WHERE Category = ? AND Sub_Category = ? AND Levels = ? AND AC_Regional_Division IS NOT NULL GROUP BY Country, AC_Regional_Division) t 
			GROUP BY Region 
			`, [MAX_YEAR, MAX_YEAR_MINUS_DECADE, iiag, category_value, sub_category_value, 'Sub-category'])

		} else if(Region_Type == 'UN_Region'){
		index_results_line_sql = alasql(`SELECT Year, ROUND(AVG(CASE WHEN UN_Region = "Central Africa" THEN [Value] ELSE NULL END), 2) AS CA_Value, 
			ROUND(AVG(CASE WHEN UN_Region = "Eastern Africa" THEN [Value] ELSE NULL END), 2) AS EA_Value, 
			ROUND(AVG(CASE WHEN UN_Region = "Northern Africa" THEN [Value] ELSE NULL END), 2) AS NA_Value, 
			ROUND(AVG(CASE WHEN UN_Region = "Western Africa" THEN [Value] ELSE NULL END), 2) AS WA_Value, 
			ROUND(AVG(CASE WHEN UN_Region = "Southern Africa" THEN [Value] ELSE NULL END), 2) AS SA_Value, 
			ROUND(AVG([Value]), 2) AS [Value] FROM ? WHERE Category = ? AND Sub_Category = ? AND Levels = ? GROUP BY Year ORDER BY Year`, 
			[iiag, category_value, sub_category_value, 'Sub-category']);

		index_region_trend_sql = alasql(`
			SELECT 
			ROUND(AVG([Change]), 2) AS Change, Region FROM 
				(SELECT SUM(CASE WHEN [Year] == ? THEN [Value] ELSE 0 END - CASE WHEN [Year] == ? THEN [Value] ELSE 0 END) AS [Change], 
				UN_Region AS Region FROM ? WHERE Category = ? AND Sub_Category = ? AND Levels = ? AND UN_Region IS NOT NULL GROUP BY Country, UN_Region) t 
			GROUP BY Region 
			`, [MAX_YEAR, MAX_YEAR_MINUS_DECADE, iiag, category_value, sub_category_value, 'Sub-category'])

		} else if(Region_Type == 'AU_Region'){
		index_results_line_sql = alasql(`SELECT Year, ROUND(AVG(CASE WHEN AU_Region = "Central Africa" THEN [Value] ELSE NULL END), 2) AS CA_Value, 
			ROUND(AVG(CASE WHEN AU_Region = "Eastern Africa" THEN [Value] ELSE NULL END), 2) AS EA_Value, 
			ROUND(AVG(CASE WHEN AU_Region = "Northern Africa" THEN [Value] ELSE NULL END), 2) AS NA_Value, 
			ROUND(AVG(CASE WHEN AU_Region = "Western Africa" THEN [Value] ELSE NULL END), 2) AS WA_Value, 			
			ROUND(AVG(CASE WHEN AU_Region = "Southern Africa" THEN [Value] ELSE NULL END), 2) AS SA_Value, 
			ROUND(AVG([Value]), 2) AS [Value] FROM ? WHERE Category = ? AND Sub_Category = ? AND Levels = ? GROUP BY Year ORDER BY Year`, 
			[iiag,  category_value, sub_category_value, 'Sub-category']);

		index_region_trend_sql = alasql(`
			SELECT 
			ROUND(AVG([Change]), 2) AS Change, Region FROM 
				(SELECT SUM(CASE WHEN [Year] == ? THEN [Value] ELSE 0 END - CASE WHEN [Year] == ? THEN [Value] ELSE 0 END) AS [Change], 
				AU_Region AS Region FROM ? WHERE Category = ? AND Sub_Category = ? AND Levels = ? AND UN_Region IS NOT NULL GROUP BY Country, AU_Region) t 
			GROUP BY Region 
			`, [MAX_YEAR, MAX_YEAR_MINUS_DECADE, iiag, category_value, sub_category_value, 'Sub-category'])
		}

	} else if(Level == 'Level4'){
		if(Region_Type == 'AC_Region'){
		index_results_line_sql = alasql(`SELECT Year, ROUND(AVG(CASE WHEN AC_Region = "Northern Africa" THEN [Value] ELSE NULL END), 2) AS NA_Value, 
				ROUND(AVG(CASE WHEN AC_Region = "Sahel & Lake Chad Basin" THEN [Value] ELSE NULL END), 2) AS Sahel_Value, 
				ROUND(AVG(CASE WHEN AC_Region = "Gulf of Guinea" THEN [Value] ELSE NULL END), 2) AS GG_Value, 
				ROUND(AVG(CASE WHEN AC_Region = "East Africa" THEN [Value] ELSE NULL END), 2) AS EA_Value, 
				ROUND(AVG(CASE WHEN AC_Region = "North Africa" THEN [Value] ELSE NULL END), 2) AS NA_Value, 
				ROUND(AVG(CASE WHEN AC_Region = "South Africa" THEN [Value] ELSE NULL END), 2) AS SA_Value, 
				ROUND(AVG([Value]), 2) AS [Value] FROM ? WHERE Category = ? AND Sub_Category = ? AND Indicator = ? 
			AND Levels = ? GROUP BY Year ORDER BY Year`, 
			[iiag,  category_value, sub_category_value, indicator_value, 'Indicator']);

		index_region_trend_sql = alasql(`
			SELECT 
			ROUND(AVG([Change]), 2) AS Change, Region FROM 
				(SELECT SUM(CASE WHEN [Year] == ? THEN [Value] ELSE 0 END - CASE WHEN [Year] == ? THEN [Value] ELSE 0 END) AS [Change], 
				AC_Region AS Region FROM ? WHERE Category = ? AND Sub_Category = ? AND Indicator = ? AND Levels = ? AND AC_Region IS NOT NULL GROUP BY Country, AC_Region) t 
			GROUP BY Region 
			`, [MAX_YEAR, MAX_YEAR_MINUS_DECADE, iiag, category_value, sub_category_value, indicator_value, 'Indicator'])

		} else if(Region_Type == 'AC_Regional_Division'){
		
			index_results_line_sql = alasql(`SELECT Year, ROUND(AVG(CASE WHEN AC_Regional_Division = "J53" THEN [Value] ELSE NULL END), 2) AS J53_Value, 
				ROUND(AVG(CASE WHEN AC_Regional_Division = "J52" THEN [Value] ELSE NULL END), 2) AS J52_Value, 
				ROUND(AVG(CASE WHEN AC_Regional_Division = "J51" THEN [Value] ELSE NULL END), 2) AS J51_Value, 
				ROUND(AVG([Value]), 2) AS [Value] FROM ? WHERE Category = ? AND Sub_Category = ? AND Indicator = ? 
				AND Levels = ? GROUP BY Year ORDER BY Year`, [iiag,  category_value, sub_category_value, indicator_value, 'Indicator']); 

		index_region_trend_sql = alasql(`
			SELECT 
			ROUND(AVG([Change]), 2) AS Change, Region FROM 
				(SELECT SUM(CASE WHEN [Year] == ? THEN [Value] ELSE 0 END - CASE WHEN [Year] == ? THEN [Value] ELSE 0 END) AS [Change], 
				AC_Regional_Division AS Region FROM ? WHERE Category = ? AND Sub_Category = ? AND Indicator = ? AND Levels = ? AND AC_Regional_Division IS NOT NULL GROUP BY Country, AC_Regional_Division) t 
			GROUP BY Region 
			`, [MAX_YEAR, MAX_YEAR_MINUS_DECADE, iiag, category_value, sub_category_value, indicator_value, 'Indicator'])

		} else if(Region_Type == 'UN_Region'){

		index_results_line_sql = alasql(`SELECT Year, ROUND(AVG(CASE WHEN UN_Region = "Central Africa" THEN [Value] ELSE NULL END), 2) AS CA_Value, 
			ROUND(AVG(CASE WHEN UN_Region = "Eastern Africa" THEN [Value] ELSE NULL END), 2) AS EA_Value, 
			ROUND(AVG(CASE WHEN UN_Region = "Northern Africa" THEN [Value] ELSE NULL END), 2) AS NA_Value, 
			ROUND(AVG(CASE WHEN UN_Region = "Western Africa" THEN [Value] ELSE NULL END), 2) AS WA_Value, 
			ROUND(AVG(CASE WHEN UN_Region = "Southern Africa" THEN [Value] ELSE NULL END), 2) AS SA_Value, 
			ROUND(AVG([Value]), 2) AS [Value] FROM ? WHERE Category = ? AND Sub_Category = ? AND Indicator = ? AND Levels = ? GROUP BY Year ORDER BY Year`, 
			[iiag, category_value, sub_category_value, indicator_value, 'Indicator']);

		index_region_trend_sql = alasql(`
			SELECT 
			ROUND(AVG([Change]), 2) AS Change, Region FROM 
				(SELECT SUM(CASE WHEN [Year] == ? THEN [Value] ELSE 0 END - CASE WHEN [Year] == ? THEN [Value] ELSE 0 END) AS [Change], 
				UN_Region AS Region FROM ? WHERE Category = ? AND Sub_Category = ? AND Indicator = ? AND Levels = ? AND UN_Region IS NOT NULL GROUP BY Country, UN_Region) t 
			GROUP BY Region 
			`, [MAX_YEAR, MAX_YEAR_MINUS_DECADE, iiag, category_value, sub_category_value, indicator_value, 'Indicator'])


		} else if(Region_Type == 'AU_Region'){
		
		index_results_line_sql = alasql(`SELECT Year, ROUND(AVG(CASE WHEN AU_Region = "Central Africa" THEN [Value] ELSE NULL END), 2) AS CA_Value, 
			ROUND(AVG(CASE WHEN AU_Region = "Eastern Africa" THEN [Value] ELSE NULL END), 2) AS EA_Value, 
			ROUND(AVG(CASE WHEN AU_Region = "Northern Africa" THEN [Value] ELSE NULL END), 2) AS NA_Value, 
			ROUND(AVG(CASE WHEN AU_Region = "Western Africa" THEN [Value] ELSE NULL END), 2) AS WA_Value, 			
			ROUND(AVG(CASE WHEN AU_Region = "Southern Africa" THEN [Value] ELSE NULL END), 2) AS SA_Value, 
			ROUND(AVG([Value]), 2) AS [Value] FROM ? WHERE Category = ? AND Sub_Category = ? AND Indicator = ? AND Levels = ? GROUP BY Year ORDER BY Year`, 
			[iiag,  category_value, sub_category_value, indicator_value, 'Indicator']);

		index_region_trend_sql = alasql(`
			SELECT 
			ROUND(AVG([Change]), 2) AS Change, Region FROM 
				(SELECT SUM(CASE WHEN [Year] == ? THEN [Value] ELSE 0 END - CASE WHEN [Year] == ? THEN [Value] ELSE 0 END) AS [Change], 
				AU_Region AS Region FROM ? WHERE Category = ? AND Sub_Category = ? AND Indicator = ? AND Levels = ? AND AU_Region IS NOT NULL GROUP BY Country, AU_Region) t 
			GROUP BY Region 
			`, [MAX_YEAR, MAX_YEAR_MINUS_DECADE, iiag, category_value, sub_category_value, indicator_value, 'Indicator'])

		}
	} else if(Level == 'Level5'){
		if(Region_Type == 'AC_Region'){
		index_results_line_sql = alasql(`SELECT Year, ROUND(AVG(CASE WHEN AC_Region = "Northern Africa" THEN [Value] ELSE NULL END), 2) AS NA_Value, 
				ROUND(AVG(CASE WHEN AC_Region = "Sahel & Lake Chad Basin" THEN [Value] ELSE NULL END), 2) AS Sahel_Value, 
				ROUND(AVG(CASE WHEN AC_Region = "Gulf of Guinea" THEN [Value] ELSE NULL END), 2) AS GG_Value, 
				ROUND(AVG(CASE WHEN AC_Region = "East Africa" THEN [Value] ELSE NULL END), 2) AS EA_Value, 
				ROUND(AVG(CASE WHEN AC_Region = "North Africa" THEN [Value] ELSE NULL END), 2) AS NA_Value, 
				ROUND(AVG(CASE WHEN AC_Region = "South Africa" THEN [Value] ELSE NULL END), 2) AS SA_Value, 
				ROUND(AVG([Value]), 2) AS [Value] FROM ? WHERE Category = ? AND Sub_Category = ? AND Indicator = ? AND Sub_Indicator = ? 
			AND Levels = ? GROUP BY Year ORDER BY Year`, 
			[iiag,  category_value, sub_category_value, indicator_value, sub_indicator_value, 'Sub-indicator']);

		index_region_trend_sql = alasql(`
			SELECT 
			ROUND(AVG([Change]), 2) AS Change, Region FROM 
				(SELECT SUM(CASE WHEN [Year] == ? THEN [Value] ELSE 0 END - CASE WHEN [Year] == ? THEN [Value] ELSE 0 END) AS [Change], 
				AC_Region AS Region FROM ? WHERE Category = ? AND Sub_Category = ? AND Indicator = ? AND Sub_Indicator = ? AND Levels = ? AND AC_Region IS NOT NULL GROUP BY Country, AC_Region) t 
			GROUP BY Region 
			`, [MAX_YEAR, MAX_YEAR_MINUS_DECADE, iiag, category_value, sub_category_value, indicator_value, sub_indicator_value, 'Sub-indicator'])

		} else if(Region_Type == 'AC_Regional_Division'){
		
			index_results_line_sql = alasql(`SELECT Year, ROUND(AVG(CASE WHEN AC_Regional_Division = "J53" THEN [Value] ELSE NULL END), 2) AS J53_Value, 
				ROUND(AVG(CASE WHEN AC_Regional_Division = "J52" THEN [Value] ELSE NULL END), 2) AS J52_Value, 
				ROUND(AVG(CASE WHEN AC_Regional_Division = "J51" THEN [Value] ELSE NULL END), 2) AS J51_Value, 
				ROUND(AVG([Value]), 2) AS [Value] FROM ? WHERE Category = ? AND Sub_Category = ? AND Indicator = ? AND Sub_Indicator = ? 
				AND Levels = ? GROUP BY Year ORDER BY Year`, [iiag,  category_value, sub_category_value, indicator_value, sub_indicator_value, 'Sub-indicator']); 

		index_region_trend_sql = alasql(`
			SELECT 
			ROUND(AVG([Change]), 2) AS Change, Region FROM 
				(SELECT SUM(CASE WHEN [Year] == ? THEN [Value] ELSE 0 END - CASE WHEN [Year] == ? THEN [Value] ELSE 0 END) AS [Change], 
				AC_Regional_Division AS Region FROM ? WHERE Category = ? AND Sub_Category = ? AND Indicator = ? AND Sub_Indicator = ? AND Levels = ? AND AC_Regional_Division IS NOT NULL GROUP BY Country, AC_Regional_Division) t 
			GROUP BY Region 
			`, [MAX_YEAR, MAX_YEAR_MINUS_DECADE, iiag, category_value, sub_category_value, indicator_value, sub_indicator_value, 'Sub-indicator'])

		} else if(Region_Type == 'UN_Region'){

		index_results_line_sql = alasql(`SELECT Year, ROUND(AVG(CASE WHEN UN_Region = "Central Africa" THEN [Value] ELSE NULL END), 2) AS CA_Value, 
			ROUND(AVG(CASE WHEN UN_Region = "Eastern Africa" THEN [Value] ELSE NULL END), 2) AS EA_Value, 
			ROUND(AVG(CASE WHEN UN_Region = "Northern Africa" THEN [Value] ELSE NULL END), 2) AS NA_Value, 
			ROUND(AVG(CASE WHEN UN_Region = "Western Africa" THEN [Value] ELSE NULL END), 2) AS WA_Value, 
			ROUND(AVG(CASE WHEN UN_Region = "Southern Africa" THEN [Value] ELSE NULL END), 2) AS SA_Value, 
			ROUND(AVG([Value]), 2) AS [Value] FROM ? WHERE Category = ? AND Sub_Category = ? AND Indicator = ? AND Sub_Indicator = ? AND Levels = ? GROUP BY Year ORDER BY Year`, 
			[iiag, category_value, sub_category_value, indicator_value, sub_indicator_value, 'Sub-indicator']);

		index_region_trend_sql = alasql(`
			SELECT 
			ROUND(AVG([Change]), 2) AS Change, Region FROM 
				(SELECT SUM(CASE WHEN [Year] == ? THEN [Value] ELSE 0 END - CASE WHEN [Year] == ? THEN [Value] ELSE 0 END) AS [Change], 
				UN_Region AS Region FROM ? WHERE Category = ? AND Sub_Category = ? AND Indicator = ? AND Sub_Indicator = ? AND Levels = ? AND UN_Region IS NOT NULL GROUP BY Country, UN_Region) t 
			GROUP BY Region 
			`, [MAX_YEAR, MAX_YEAR_MINUS_DECADE, iiag, category_value, sub_category_value, indicator_value, sub_indicator_value, 'Sub-indicator'])


		} else if(Region_Type == 'AU_Region'){
		
		index_results_line_sql = alasql(`SELECT Year, ROUND(AVG(CASE WHEN AU_Region = "Central Africa" THEN [Value] ELSE NULL END), 2) AS CA_Value, 
			ROUND(AVG(CASE WHEN AU_Region = "Eastern Africa" THEN [Value] ELSE NULL END), 2) AS EA_Value, 
			ROUND(AVG(CASE WHEN AU_Region = "Northern Africa" THEN [Value] ELSE NULL END), 2) AS NA_Value, 
			ROUND(AVG(CASE WHEN AU_Region = "Western Africa" THEN [Value] ELSE NULL END), 2) AS WA_Value, 			
			ROUND(AVG(CASE WHEN AU_Region = "Southern Africa" THEN [Value] ELSE NULL END), 2) AS SA_Value, 
			ROUND(AVG([Value]), 2) AS [Value] FROM ? WHERE Category = ? AND Sub_Category = ? AND Indicator = ? AND Sub_Indicator = ? AND Levels = ? GROUP BY Year ORDER BY Year`, 
			[iiag,  category_value, sub_category_value, indicator_value, sub_indicator_value, 'Sub-indicator']);

		index_region_trend_sql = alasql(`
			SELECT 
			ROUND(AVG([Change]), 2) AS Change, Region FROM 
				(SELECT SUM(CASE WHEN [Year] == ? THEN [Value] ELSE 0 END - CASE WHEN [Year] == ? THEN [Value] ELSE 0 END) AS [Change], 
				AU_Region AS Region FROM ? WHERE Category = ? AND Sub_Category = ? AND Indicator = ? AND Sub_Indicator = ? AND Levels = ? AND AU_Region IS NOT NULL GROUP BY Country, AU_Region) t 
			GROUP BY Region 
			`, [MAX_YEAR, MAX_YEAR_MINUS_DECADE, iiag, category_value, sub_category_value, indicator_value, sub_indicator_value, 'Sub-indicator'])

		}
	} else if(Level == 'Level6'){
		console.log('running regions')
		if(Region_Type == 'AC_Region'){
		index_results_line_sql = alasql(`SELECT Year, ROUND(AVG(CASE WHEN AC_Region = "Northern Africa" THEN [Value] ELSE NULL END), 2) AS NA_Value, 
				ROUND(AVG(CASE WHEN AC_Region = "Sahel & Lake Chad Basin" THEN [Value] ELSE NULL END), 2) AS Sahel_Value, 
				ROUND(AVG(CASE WHEN AC_Region = "Gulf of Guinea" THEN [Value] ELSE NULL END), 2) AS GG_Value, 
				ROUND(AVG(CASE WHEN AC_Region = "East Africa" THEN [Value] ELSE NULL END), 2) AS EA_Value, 
				ROUND(AVG(CASE WHEN AC_Region = "North Africa" THEN [Value] ELSE NULL END), 2) AS NA_Value, 
				ROUND(AVG(CASE WHEN AC_Region = "South Africa" THEN [Value] ELSE NULL END), 2) AS SA_Value, 
				ROUND(AVG([Value]), 2) AS [Value] FROM ? WHERE Category = ? AND Sub_Category = ? AND Indicator = ? AND Sub_Indicator = ? AND Sub_Sub_Indicator = ? 
			AND Levels = ? GROUP BY Year ORDER BY Year`, 
			[iiag,  category_value, sub_category_value, indicator_value, sub_indicator_value, sub_sub_indicator_value, 'Sub-sub-indicator']);

		index_region_trend_sql = alasql(`
			SELECT 
			ROUND(AVG([Change]), 2) AS Change, Region FROM 
				(SELECT SUM(CASE WHEN [Year] == ? THEN [Value] ELSE 0 END - CASE WHEN [Year] == ? THEN [Value] ELSE 0 END) AS [Change], 
				AC_Region AS Region FROM ? WHERE Category = ? AND Sub_Category = ? AND Indicator = ? AND Sub_Indicator = ? AND Sub_Sub_Indicator = ? AND Levels = ? AND AC_Region IS NOT NULL GROUP BY Country, AC_Region) t 
			GROUP BY Region 
			`, [MAX_YEAR, MAX_YEAR_MINUS_DECADE, iiag, category_value, sub_category_value, indicator_value, sub_indicator_value, sub_sub_indicator_value, 'Sub-sub-indicator'])

		} else if(Region_Type == 'AC_Regional_Division'){
		
			index_results_line_sql = alasql(`SELECT Year, ROUND(AVG(CASE WHEN AC_Regional_Division = "J53" THEN [Value] ELSE NULL END), 2) AS J53_Value, 
				ROUND(AVG(CASE WHEN AC_Regional_Division = "J52" THEN [Value] ELSE NULL END), 2) AS J52_Value, 
				ROUND(AVG(CASE WHEN AC_Regional_Division = "J51" THEN [Value] ELSE NULL END), 2) AS J51_Value, 
				ROUND(AVG([Value]), 2) AS [Value] FROM ? WHERE Category = ? AND Sub_Category = ? AND Indicator = ? AND Sub_Indicator = ? AND Sub_Sub_Indicator = ? 
				AND Levels = ? GROUP BY Year ORDER BY Year`, [iiag,  category_value, sub_category_value, indicator_value, sub_indicator_value, sub_sub_indicator_value, 'Sub-sub-indicator']); 

		index_region_trend_sql = alasql(`
			SELECT 
			ROUND(AVG([Change]), 2) AS Change, Region FROM 
				(SELECT SUM(CASE WHEN [Year] == ? THEN [Value] ELSE 0 END - CASE WHEN [Year] == ? THEN [Value] ELSE 0 END) AS [Change], 
				AC_Regional_Division AS Region FROM ? WHERE Category = ? AND Sub_Category = ? AND Indicator = ? AND Sub_Indicator = ? AND Sub_Sub_Indicator = ? AND Levels = ? AND AC_Regional_Division IS NOT NULL GROUP BY Country, AC_Regional_Division) t 
			GROUP BY Region 
			`, [MAX_YEAR, MAX_YEAR_MINUS_DECADE, iiag, category_value, sub_category_value, indicator_value, sub_indicator_value, sub_sub_indicator_value, 'Sub-sub-indicator'])

		} else if(Region_Type == 'UN_Region'){

		index_results_line_sql = alasql(`SELECT Year, ROUND(AVG(CASE WHEN UN_Region = "Central Africa" THEN [Value] ELSE NULL END), 2) AS CA_Value, 
			ROUND(AVG(CASE WHEN UN_Region = "Eastern Africa" THEN [Value] ELSE NULL END), 2) AS EA_Value, 
			ROUND(AVG(CASE WHEN UN_Region = "Northern Africa" THEN [Value] ELSE NULL END), 2) AS NA_Value, 
			ROUND(AVG(CASE WHEN UN_Region = "Western Africa" THEN [Value] ELSE NULL END), 2) AS WA_Value, 
			ROUND(AVG(CASE WHEN UN_Region = "Southern Africa" THEN [Value] ELSE NULL END), 2) AS SA_Value, 
			ROUND(AVG([Value]), 2) AS [Value] FROM ? WHERE Category = ? AND Sub_Category = ? AND Indicator = ? AND Sub_Indicator = ? AND Sub_Sub_Indicator = ? AND Levels = ? GROUP BY Year ORDER BY Year`, 
			[iiag, category_value, sub_category_value, indicator_value, sub_indicator_value, sub_sub_indicator_value, 'Sub-sub-indicator']);

		index_region_trend_sql = alasql(`
			SELECT 
			ROUND(AVG([Change]), 2) AS Change, Region FROM 
				(SELECT SUM(CASE WHEN [Year] == ? THEN [Value] ELSE 0 END - CASE WHEN [Year] == ? THEN [Value] ELSE 0 END) AS [Change], 
				UN_Region AS Region FROM ? WHERE Category = ? AND Sub_Category = ? AND Indicator = ? AND Sub_Indicator = ? AND Sub_Sub_Indicator = ? AND Levels = ? AND UN_Region IS NOT NULL GROUP BY Country, UN_Region) t 
			GROUP BY Region 
			`, [MAX_YEAR, MAX_YEAR_MINUS_DECADE, iiag, category_value, sub_category_value, indicator_value, sub_indicator_value, sub_sub_indicator_value, 'Sub-sub-indicator'])


		} else if(Region_Type == 'AU_Region'){
		
		index_results_line_sql = alasql(`SELECT Year, ROUND(AVG(CASE WHEN AU_Region = "Central Africa" THEN [Value] ELSE NULL END), 2) AS CA_Value, 
			ROUND(AVG(CASE WHEN AU_Region = "Eastern Africa" THEN [Value] ELSE NULL END), 2) AS EA_Value, 
			ROUND(AVG(CASE WHEN AU_Region = "Northern Africa" THEN [Value] ELSE NULL END), 2) AS NA_Value, 
			ROUND(AVG(CASE WHEN AU_Region = "Western Africa" THEN [Value] ELSE NULL END), 2) AS WA_Value, 			
			ROUND(AVG(CASE WHEN AU_Region = "Southern Africa" THEN [Value] ELSE NULL END), 2) AS SA_Value, 
			ROUND(AVG([Value]), 2) AS [Value] FROM ? WHERE Category = ? AND Sub_Category = ? AND Indicator = ? AND Sub_Indicator = ? AND Sub_Sub_Indicator = ? AND Levels = ? GROUP BY Year ORDER BY Year`, 
			[iiag,  category_value, sub_category_value, indicator_value, sub_indicator_value, sub_sub_indicator_value, 'Sub-sub-indicator']);

		index_region_trend_sql = alasql(`
			SELECT 
			ROUND(AVG([Change]), 2) AS Change, Region FROM 
				(SELECT SUM(CASE WHEN [Year] == ? THEN [Value] ELSE 0 END - CASE WHEN [Year] == ? THEN [Value] ELSE 0 END) AS [Change], 
				AU_Region AS Region FROM ? WHERE Category = ? AND Sub_Category = ? AND Indicator = ? AND Sub_Indicator = ? AND Sub_Sub_Indicator = ? AND Levels = ? AND AU_Region IS NOT NULL GROUP BY Country, AU_Region) t 
			GROUP BY Region 
			`, [MAX_YEAR, MAX_YEAR_MINUS_DECADE, iiag, category_value, sub_category_value, indicator_value, sub_indicator_value, sub_sub_indicator_value, 'Sub-sub-indicator'])

		}
	}
	return {'line' : index_results_line_sql, 'trend' : index_region_trend_sql}
}

//AC Region - Sahel & Lake Chad Basin" "Gulf of Guinea"          "East Africa"             "North Africa", South Africa

//> unique(iiag_data$AC_Regional_Division)
//[1] "J53" "J52" "J51" NA   
//> unique(iiag_data$UN_Region)
//[1] "Central Africa"  "Eastern Africa"  "Northern Africa" NA                "Western Africa"  "Southern Africa"
//> unique(iiag_data$AU_Region)
//[1] "Central Africa"  "Eastern Africa"  "Northern Africa" "Southern Africa" NA                "Western Africa" 





