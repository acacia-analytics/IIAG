//Initial country selectors 

var Countries = Object.keys(data_drilldown);
var Countries = Countries.sort();

var e_select_country_comparison = document.getElementById("select_country_comparison");
var e_select_country_table = document.getElementById("select_country_table");

//Should add an overall average comparison
//e_select_country.options.add(new Option('Average across Countries', value = 'Average'));             

for(c in Countries){
	e_select_country_comparison.options.add(new Option(Countries[c], value = Countries[c]));             
	e_select_country_table.options.add(new Option(Countries[c], value = Countries[c]));             

}

//Inital Drilldown Chart 
country = e_select_country_comparison.options[e_select_country_comparison.selectedIndex].value;
level1_data = data_drilldown[country];
hierarchy_data = data_drilldown_hierarchy[country];

var indicator_value_drilldown_chart = Highcharts.chart('indicators-compare', { 
	chart : {
		type : 'column'
	}, 
    title: {
        text: 'Category Indices'
    },
	credits : {enabled : false},	
	legend: {
	    enabled: false
	},	    		
    xAxis: {
        type : 'category',
    },
    plotOptions : {
    	column : {
    		minPointLength : 3
    	}
    }, 
    yAxis: {
        title: {
            text: '2021 IIAG Index'
        }
    },
    series : level1_data,
    drilldown : hierarchy_data
});


function makeTable(category){

	var e_select_country_table = document.getElementById("select_country_table");
    var select_country_table = e_select_country_table.options[e_select_country_table.selectedIndex].value;

	var tData;

	alasql.promise(
		'SELECT Country, Sub_Category AS Sub_Category, Indicator AS [Indicator], AC_Region AS AC_Region, index_vals, [Value] AS [Score], Value_Change AS [Change], Rank, Levels FROM ? WHERE Year = ? AND Levels IN ("Sub-category", "Indicator") AND Country = ? AND Category = ? ORDER BY index_vals', 
		[iiag, MAX_YEAR, select_country_table, category]).then(function(res){
		tData = res
	     	indicator_table();
	})

	var indicator_table = function () {
	    $(document).ready(function() { 

			if ( $.fn.dataTable.isDataTable( '#indicator-table' ) ) {
				    $('#indicator-table').DataTable().destroy();
			};
	 
	        $('#indicator-table').DataTable( {
	            data: tData,
	            columns: [
					{ data: "Country", title: "Country"},
					{ data: "AC_Region", title: "AFRICOM Region"},
					{ data: "Sub_Category", title: "Sub Category"},				
					{ data: "Indicator", title: "Indicator"},				
					{ data: "Score", title: "Score"},
					{ data: "Change", title: "Change"},
					{ data: "Rank", title: "Rank"}
	            ],
                paging: false,
	            rowCallback : function(row, data, index) {
	            	if(data.Levels == 'Sub-category'){
	            		$(row).css('font-weight', 'bold');
	            	}	
	            },        
	            allowColumnResizing: true,	            
	            columnDefs: [{
	                "defaultContent": "-",
	                "orderable" : false,
	                "targets": "_all"
	            }]
	         });
	    });
	}
}

//Initail table view 
 makeTable('PARTICIPATION, RIGHTS & INCLUSION');

//Switch classes
$('#category_button button').click(function() {
    $(this).addClass('active').siblings().removeClass('active');
});


function selectCountryTableResponse(){
	var buttons = document.getElementsByClassName("btn-light");
	for (b in buttons) {
		if(buttons[b].classList != undefined){
		   if(buttons[b].classList.contains('active')){
		   	if(buttons[b].id == 'pri-btn')  makeTable('PARTICIPATION, RIGHTS & INCLUSION');
		   	if(buttons[b].id == 'srl-btn')  makeTable('SECURITY & RULE OF LAW');
		   	if(buttons[b].id == 'feo-btn')  makeTable('FOUNDATIONS FOR ECONOMIC OPPORTUNITY');
		   	if(buttons[b].id == 'hd-btn')  makeTable('HUMAN DEVELOPMENT');
		   }		
		}
	}
}


function selectCountryResponse(){
	var e_select_country_comparison = document.getElementById("select_country_comparison");
	country = e_select_country_comparison.options[e_select_country_comparison.selectedIndex].value;
	
	//Update drilldown chart 
	level1_data = data_drilldown[country];
	hierarchy_data = data_drilldown_hierarchy[country];
	console.log(hierarchy_data);
	var indicator_value_drilldown_chart = Highcharts.chart('indicators-compare', { 
		chart : {
			type : 'column'
		}, 
	    title: {
	        text: 'Index Component Comparisons'
	    },
		credits : {enabled : false},	
		legend: {
		    enabled: false
		},	    		
	    xAxis: {
	        type : 'category',
	    },			    				
	    yAxis: {
	        title: {
	            text: '2021 Index'
	        }
	    },
	    series : level1_data,
	    drilldown : hierarchy_data
	});

}





