
function update_page2_charts(country){

    var e_category = document.getElementById("select_category-country");
    var e_sub_category = document.getElementById("select_sub_category-country");
    var e_indicator = document.getElementById("select_indicator-country");
    var e_sub_indicator = document.getElementById("select_sub_indicator-country");
    var e_sub_sub_indicator = document.getElementById("select_sub_indicator-country");

	var category_value;
	var sub_category_value;
	var indicator_value;
	var sub_indicator_value;
	var sub_sub_indicator_value;

	category_value = e_category.options[e_category.selectedIndex].value;

	if(e_sub_category.options.length == 0){
		sub_category_value = undefined;
	} else{
		sub_category_value = e_sub_category.options[e_sub_category.selectedIndex].value;

	}
	if(e_indicator.options.length == 0){
		indicator_value = undefined;
	} else{
		indicator_value = e_indicator.options[e_indicator.selectedIndex].value;

	}
	if(e_sub_indicator.options.length == 0){
		sub_indicator_value = undefined;
	} else{
		sub_indicator_value = e_sub_indicator.options[e_sub_indicator.selectedIndex].value;

	}
	if(e_sub_sub_indicator.options.length == 0){
		sub_sub_indicator_value = undefined;
	} else{
		sub_sub_indicator_value = e_sub_sub_indicator.options[e_sub_sub_indicator.selectedIndex].value;

	}

	document.getElementById("headerTitle-pg2").textContent = country;

	if(category_value == "OVERALL GOVERNANCE"){

		var country_index_results_by_year = alasql('SELECT Year, [Value]  FROM ? WHERE Country = ? AND Levels = ? ORDER BY Year' ,[iiag, country, 'Overall']);
		var card_results = alasql('SELECT [Value], [Value_Change], [Rank]  FROM ? WHERE Country = ? AND Year = ? AND Levels = ?' ,[iiag, country, MAX_YEAR, 'Overall']);
		var country_results = alasql('SELECT [Value], Country, CASE WHEN Country = ? THEN "#f7a35c" ELSE "#7cb5ec" END AS Color FROM ? WHERE Year = ? AND Levels = ?' ,[country, iiag, MAX_YEAR, 'Overall']);

	} else if(sub_category_value == "Overall" | sub_category_value == undefined){
		var country_index_results_by_year = alasql('SELECT Year, [Value]  FROM ? WHERE Country = ? AND Category = ? AND Levels = ? ORDER BY Year' ,[iiag, country, category_value, 'Category']);
		var card_results = alasql('SELECT [Value], [Value_Change], [Rank]  FROM ? WHERE Country = ? AND Year = ? AND Category = ? AND Levels = ?' ,[iiag, country, MAX_YEAR, category_value, 'Category']);
		var country_results = alasql('SELECT [Value], Country, CASE WHEN Country = ? THEN "#f7a35c" ELSE "#7cb5ec" END AS Color FROM ? WHERE Year = ? AND Category = ? AND Levels = ?' ,[country, iiag, MAX_YEAR, category_value, 'Category']);

	} else if(indicator_value == "Overall" | indicator_value == undefined) {  
		var country_index_results_by_year = alasql('SELECT Year, [Value]  FROM ? WHERE Country = ? AND Category = ? AND Sub_Category = ? AND Levels = ? ORDER BY Year' ,[iiag, country, category_value, sub_category_value, 'Sub-category']);
		var card_results = alasql('SELECT [Value], [Value_Change], [Rank]  FROM ? WHERE Country = ? AND Year = ? AND Category = ? AND Sub_Category = ? AND Levels = ?' ,[iiag, country, MAX_YEAR, category_value, sub_category_value, 'Sub-category']);
		var country_results = alasql('SELECT [Value], Country, CASE WHEN Country = ? THEN "#f7a35c" ELSE "#7cb5ec" END AS Color FROM ? WHERE Year = ? AND Category = ? AND Sub_Category = ? AND Levels = ?' ,[country, iiag, MAX_YEAR, category_value, sub_category_value, 'Sub-category']);

	} else {
		var country_index_results_by_year = alasql('SELECT Year, [Value]  FROM ? WHERE Country = ? AND Category = ? AND Sub_Category = ? AND Indicator = ? AND Levels = ? ORDER BY Year' ,[iiag, country, category_value, sub_category_value, indicator_value, 'Indicator']);
		var card_results = alasql('SELECT [Value], [Value_Change], [Rank]  FROM ? WHERE Country = ? AND Year = ? AND Category = ? AND Sub_Category = ? AND Indicator = ? AND Levels = ?' ,[iiag, country, MAX_YEAR, category_value, sub_category_value, indicator_value, 'Indicator']);	
		var country_results = alasql('SELECT [Value], Country, CASE WHEN Country = ? THEN "#f7a35c" ELSE "#7cb5ec" END AS Color FROM ? WHERE Year = ? AND Category = ? AND Sub_Category = ? AND Indicator = ? AND Levels = ?' ,[country, iiag, MAX_YEAR, category_value, sub_category_value, indicator_value, 'Indicator']);

	}

	country_index_by_category = alasql('SELECT Category, [Value] FROM ? WHERE Country = ? AND Levels = "Category" AND Year = ?' ,[iiag, country, MAX_YEAR]);

	var country_index_by_category_hc = make_dict(country_index_by_category, 'Category', 'Value');
	var country_index_results_by_year_hc = make_tuples(country_index_results_by_year, 'Year', 'Value');

	var country_results_hc = make_multi_dict(country_results, 'Country', ['Value', 'Color'])

	//Country Card visuals 
	var card_value;
	var card_value_change;
	var card_value_rank;
	
	if(card_results[0]['Rank'] in window){
		card_value = 'Not Scored';
	} else{
		card_value = card_results[0]['Rank'];
	}
	if(card_results[0]['Value_Change'] in window){
		card_value_change = 'Not Scored';
	} else{
		card_value_change = card_results[0]['Value_Change']; 
	}		
	if(card_results[0]['Value'] in window){
		card_value_rank = 'Not Scored';
	} else{
		card_value_rank = card_results[0]['Value'];
	}

	document.getElementById("gc1").innerHTML = card_value;
	document.getElementById("gc2").innerHTML = card_value_change;
	document.getElementById("gc3").innerHTML = card_value_rank;
	document.getElementById("gc2-1").innerHTML = MAX_YEAR - 1; //Previous Year 

	document.getElementById("gc3-1").innerHTML = 54;

	//console.log(country_index_by_category_hc);

	// Index by Year 
	Highcharts.mapChart('index-country-by-year', {
	    chart: {
	        type: 'column'
	    },
	    title: {
	        text: 'Score over Time',
	        align : 'left',
	        margin : 50    
		},
		credits : {enabled : false},	
	    yAxis: {
	        title: {
	            text: 'Score'
	        }
	    },
	    legend:{ enabled:false },
	    series: [{
	        name: 'Score',
	        data: country_index_results_by_year_hc
	    }]
	})

	
	Highcharts.mapChart('index-bar-country-compare', {
	    chart: {
	        type: 'column'
	    },
	    title: {
	        text: 'Comparative Score',
	        align : 'left',
	        margin : 50    
		},
		credits : {enabled : false},	
		xAxis : {
			categories: country_results_hc['Country']
		},		
	    yAxis: {
	        title: {
	            text: 'Score'
	        },
	        max : 100
	    },
    		plotOptions: {
        	column: {
            	colorByPoint: true
        	}
    	},
    	colors: country_results_hc['Color'],
	    legend:{ enabled:false },
	    series: [{
	        name: 'Score',
	        data: country_results_hc['Value']
	    }]
	})
	
}

//Fill in country selector 
//Should add an overall average comparison
//e_select_country.options.add(new Option('Average across Countries', value = 'Average'));             

//Country selector change event 
var e_select_country_comparison = document.getElementById("select_country");
var Countries = Object.keys(data_drilldown);
var Countries = Countries.sort();
for(c in Countries){
	e_select_country_comparison.options.add(new Option(Countries[c], value = Countries[c]));             
}

function CountryChange(){
	// Update charts based on active values 
	const e_select_country = document.getElementById('select_country');
	var country = e_select_country.options[e_select_country.selectedIndex].value;

	const e_country_category_value = document.getElementById('select_category-country');
	const e_country_sub_category_value = document.getElementById('select_sub_category-country');
	const e_country_indicator_value = document.getElementById('select_indicator-country');

	var country_category_value = e_country_category_value.options[e_country_category_value.selectedIndex].value;

	if(e_country_sub_category_value.options.length == 0){
		var country_sub_category_value = undefined;
	} else{
		var country_sub_category_value = e_country_sub_category_value.options[e_country_sub_category_value.selectedIndex].value;
	}

	if(e_country_indicator_value.options.length == 0){
		var country_indicator_value = undefined;
	} else{
		var country_indicator_value = e_country_indicator_value.options[e_country_indicator_value.selectedIndex].value;
	}	

	update_page2_charts(country)
}

//Category, subcategory, indicator select box functionality 

function detectFormChangeCountry(evt){

	const e_select_country = document.getElementById('select_country');
	var country = e_select_country.options[e_select_country.selectedIndex].value;

    change_loc = evt.composedPath()[0].id;
    var e_category_country = document.getElementById("select_category-country");
    var category_country = e_category_country.options[e_category_country.selectedIndex].value;
    var e_sub_category_country = document.getElementById("select_sub_category-country");
    var e_indicator_country = document.getElementById("select_indicator-country");
    var e_sub_indicator_country = document.getElementById("select_sub_indicator-country");
    var e_sub_sub_indicator_country = document.getElementById("select_sub_sub_indicator-country");

    //depending if a category is selected, give them the option of selecting from a subcategory
    //Similarly for selecting from an indicator  
    if(change_loc == 'select_category-country'){
        document.getElementById("select_sub_category_div-country").style.display = "none";
        document.getElementById("select_indicator_div-country").style.display = "none";
        document.getElementById("select_sub_indicator_div-country").style.display = "none";
        document.getElementById("select_sub_sub_indicator_div-country").style.display = "none";

        document.getElementById("select_sub_category_label-country").style.display = "none";
        document.getElementById("select_indicator_label-country").style.display = "none";
        document.getElementById("select_sub_indicator_label-country").style.display = "none";
        document.getElementById("select_sub_sub_indicator_label-country").style.display = "none";

        if(category_country != 'OVERALL GOVERNANCE'){
        	document.getElementById("select_sub_category_div-country").style.display = "block";
       		document.getElementById("select_sub_category_label-country").style.display = "block";

            e_sub_category_country.options.length = 0; 

        	e_sub_category_country.options.add(new Option('Overall', value='Overall')); 

        	var sub_category_options = category_to_sub_category[category_country];
        	for(s_opts in sub_category_options){

                e_sub_category_country.options.add(new Option(sub_category_options[s_opts], value = sub_category_options[s_opts]));             
        	}

        } else {
            document.getElementById("select_category_div-country").style.display = "none";
	        document.getElementById("select_sub_category_label-country").style.display = "none";

        }
    	e_sub_category_country = undefined;        
    } else if(change_loc == 'select_sub_category-country'){
    	document.getElementById("select_indicator_div-country").style.display = "none";
    	document.getElementById("select_indicator_label-country").style.display = "none";
    	document.getElementById("select_sub_indicator_div-country").style.display = "none";
    	document.getElementById("select_sub_indicator_label-country").style.display = "none";
    	document.getElementById("select_sub_sub_indicator_div-country").style.display = "none";
    	document.getElementById("select_sub_sub_indicator_label-country").style.display = "none";

    	var sub_category_country = e_sub_category_country.options[e_sub_category_country.selectedIndex].value;
    	if(sub_category_country != "Overall"){
    		document.getElementById("select_indicator_div-country").style.display = "block";
    		document.getElementById("select_indicator_label-country").style.display = "block";

			// Fill in indicator selector 
        	e_indicator_country.options.length = 0; 
        	indicator_options_country = sub_category_to_indicator[sub_category_country];

        	e_indicator_country.options.add(new Option('Overall', value='Overall'));    
        	for(i_opts in indicator_options_country){
                e_indicator_country.options.add(new Option(indicator_options_country[i_opts], value = indicator_options_country[i_opts]));             
        	}

    	} else{
	    	document.getElementById("select_indicator_div-country").style.display = "none";
	    	document.getElementById("select_indicator_label-country").style.display = "none";

        	e_indicator_country.options.length = 0; 

    	}

        //create the indicators select box?
        //Fill in these selectors (might need to pass off to a function or something)

    } else if(change_loc == 'select_indicator-country'){
    	document.getElementById("select_sub_indicator_div-country").style.display = "none";
    	document.getElementById("select_sub_indicator_label-country").style.display = "none";
    	document.getElementById("select_sub_sub_indicator_div-country").style.display = "none";
    	document.getElementById("select_sub_sub_indicator_label-country").style.display = "none";

    	var sub_category_country = e_sub_category_country.options[e_sub_category_country.selectedIndex].value;
    	var indicator_country = e_indicator_country.options[e_indicator_country.selectedIndex].value;

    	if(indicator_country != "Overall"){
    		document.getElementById("select_sub_indicator_div-country").style.display = "block";
    		document.getElementById("select_sub_indicator_label-country").style.display = "block";

			// Fill in indicator selector 
        	e_sub_indicator_country.options.length = 0; 
        	e_sub_indicator_country.options.add(new Option('Overall', value='Overall'));    

        	sub_indicator_options = indicator_to_sub_indicator[indicator_country];

        	for(si_opts in sub_indicator_options){
                e_sub_indicator_country.options.add(new Option(sub_indicator_options[si_opts], value = sub_indicator_options[si_opts]));
        	}
        	//e_indicator.options.add(new Option('Overall', value='Overall'));    
        	//for(i_opts in indicator_options){
            //    e_indicator.options.add(new Option(indicator_options[i_opts], value = indicator_options[i_opts]));             
        	//}

    	} else{
    		document.getElementById("select_sub_indicator_div-country").style.display = "none";
    		document.getElementById("select_sub_indicator_label-country").style.display = "none";

        	e_sub_indicator_country.options.length = 0; 

    	}

        //create the indicators select box?
        //Fill in these selectors (might need to pass off to a function or something)

    } else if(change_loc == 'select_sub_indicator-country'){ 

    	document.getElementById("select_sub_sub_indicator_div-country").style.display = "none";
        document.getElementById("select_sub_sub_indicator_label-country").style.display = "none";

    	var indicator_country = e_indicator_country.options[e_indicator_country.selectedIndex].value;
    	var sub_indicator_country = e_sub_indicator_country.options[e_sub_indicator_country.selectedIndex].value;

    	if(sub_indicator_country != "Overall"){
        	
        	//Need to add check to make sure that the sub indicator has a sub sub indicator
        	sub_sub_indicator_options = sub_indicator_to_sub_sub_indicator[sub_indicator];

        	if(!(sub_sub_indicator_options in window)){
	    		document.getElementById("select_sub_sub_indicator_div-country").style.display = "block";
		        document.getElementById("select_sub_sub_indicator_label-country").style.display = "block";	    		
	        	e_sub_sub_indicator_country.options.length = 0; 

	        	e_sub_sub_indicator_country.options.add(new Option('Overall', value='Overall'));    

	        	for(ssi_opts in sub_sub_indicator_options){
	                e_sub_sub_indicator_country.options.add(new Option(sub_sub_indicator_options[ssi_opts], 
	                	value = sub_sub_indicator_options[ssi_opts]));
	        	}

        	}


    	} else{
			document.getElementById("select_sub_sub_indicator_div-country").style.display = "none";
			document.getElementById("select_sub_sub_indicator_label-country").style.display = "none";    		
        	e_sub_sub_indicator.options.length = 0; 
    	}


    } 
    update_page2_charts(country);
}



//Initial charts generation 

//Inital update 
document.getElementById('select-form-country').addEventListener('change', detectFormChangeCountry, false);

country = e_select_country_comparison.options[e_select_country_comparison.selectedIndex].value;

// Create initial chart 
update_page2_charts(country);










