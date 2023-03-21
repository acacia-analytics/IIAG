#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Tue Feb 28 13:42:35 2023

@author: joejohnson
"""

# Convert IIAG data to hierarchy 
# Generate hierarchy for bar chart 

import pandas as pd 
import json 
import math

data = pd.read_csv("/Users/joejohnson/Documents/AFRICOM/iiag/clean_iiag_data.csv")

countries = data['Country'].unique()

data = data[data['Year'] == 2021]
dataCategory = data[data['Levels'] == 'Category']

# Get average across countries 
dataCategoryMeans = dataCategory.groupby(['Index_Name']).mean('Value')
dataCategoryMeans['Index_Name'] = dataCategoryMeans.index
dataCategoryMeans['Country'] = 'Overall'
dataCategoryMeans['Levels'] = 'Category'
dataCategoryMeans['Names'] = dataCategoryMeans['Index_Name']
dataCategoryMeans['Category'] = dataCategoryMeans['Index_Name']

dataCategory = pd.concat([dataCategory, dataCategoryMeans])

data_hc = {}

for c in countries: 
    dataCategoryC = dataCategory[dataCategory['Country'] == c]
    
    data_hc[c] = [
        {
            'data' : [
                ]
        }
    ]
    for i, row in dataCategoryC.iterrows():
        dict_data = {
                    'name' : row['Category'],
                    'y' : row['Value'] ,
                    'drilldown' : row['Category']
            }
        data_hc[c][0]['data'].append(dict_data)
    

data_hc['Overall'] = [
    {
        'data' : [
            ]
    }
]
for i, row in dataCategory.iterrows():
    dict_data = {
                'name' : row['Category'],
                'y' : row['Value'] ,
                'drilldown' : row['Category']
        }
    data_hc[c][0]['data'].append(dict_data)


data_hc_json = json.dumps(data_hc)

data_hc_pp = json.dumps(data_hc, indent = 4)

with open('/Users/joejohnson/Documents/AFRICOM/webapp/index_scores/iiag/data_drilldown-view.txt', 'w') as drilldown_data:
    drilldown_data.write(data_hc_pp)    


with open('/Users/joejohnson/Documents/AFRICOM/webapp/index_scores/iiag/data_drilldown.js', 'w') as drilldown_data:
    drilldown_data.write('var data_drilldown = ' + data_hc_json)    


hier_hc = {}


dataSubCategory = data[data['Levels'] == 'Sub-category']
# Get average across countries
dataCategoryMeans = dataCategory.groupby(['Index_Name']).mean('Value')
dataCategoryMeans['Index_Name'] = dataCategoryMeans.index
dataCategoryMeans['Country'] = 'Overall'
dataCategoryMeans['Levels'] = 'Sub-category'
dataCategoryMeans['Names'] = dataCategoryMeans['Index_Name']
dataCategoryMeans['Category'] = dataCategoryMeans['Index_Name']


for c in countries: 
    dataCategoryC = dataCategory[dataCategory['Country'] == c]
    dataSubCategoryC = dataSubCategory[dataSubCategory['Country'] == c]
    
    hier_hc[c] = {
            'series' : [
                ]
        }
        
    # SubCategory Level 
    j = 0
    for i, row in dataCategoryC.iterrows():
        hier_hc[c]['series'].append({
            'name' : row['Names'],
            'id' : row['Names'],
            'data' : []
            })
        for i_s, row_s in dataSubCategoryC.iterrows():
            if(row['Names'] == row_s['Category']):
                hier_hc[c]['series'][j]['data'].append(
                    {
                        'name' : row_s['Names'], 
                        'y' : row_s['Value'],
                        'drilldown' : row_s['Names']
                    }
                    )
        j = j + 1




# Drill to indicator level 

start_from = j 

dataIndicator = data[data['Levels'] == 'Indicator']
dataIndicatorMeans = dataIndicator.groupby(['Index_Name']).mean('Value')
dataIndicatorMeans['Index_Name'] = dataIndicatorMeans.index
dataIndicatorMeans['Country'] = 'Overall'
dataIndicatorMeans['Levels'] = 'Sub-category'
dataIndicatorMeans['Names'] = dataIndicatorMeans['Index_Name']
dataIndicatorMeans['Category'] = dataIndicatorMeans['Index_Name']

for c in countries: 
    dataSubCategoryC = dataSubCategory[dataSubCategory['Country'] == c]
    dataIndicatorC = dataIndicator[dataIndicator['Country'] == c]
    # Indicator Level 
    j = start_from 
    for i, row in dataSubCategoryC.iterrows():
        hier_hc[c]['series'].append({
            'name' : row['Names'],
            'id' : row['Names'],
            'data' : [],
            })
        for i_s, row_s in dataIndicatorC.iterrows():
            if(row['Names'] == row_s['Sub_Category'] and not math.isnan(row_s['Value'])):
                hier_hc[c]['series'][j]['data'].append(
                    {
                        'name' : row_s['Names'], 
                        'y' : row_s['Value'],
                        'drilldown' : row_s['Names']
                    }
                    )
        j = j + 1

    
# Drill to sub indicator level 

start_from = j 

dataSubIndicator = data[data['Levels'] == 'Sub-indicator']
dataSubIndicatorMeans = dataSubIndicator.groupby(['Index_Name']).mean('Value') 
dataSubIndicatorMeans['Index_Name'] = dataSubIndicatorMeans.index
dataSubIndicatorMeans['Country'] = 'Overall'
dataSubIndicatorMeans['Levels'] = 'Sub-indicator'
dataSubIndicatorMeans['Names'] = dataSubIndicatorMeans['Index_Name']
dataSubIndicatorMeans['Category'] = dataSubIndicatorMeans['Index_Name']

for c in countries: 
    dataIndicatorC = dataIndicator[dataIndicator['Country'] == c]
    dataSubIndicatorC = dataSubIndicator[dataSubIndicator['Country'] == c]
    # Sub Indicator Level 
    j = start_from 
    
    for i, row in dataIndicatorC.iterrows():
        hier_hc[c]['series'].append({
            'name' : row['Names'],
            'id' : row['Names'],
            'data' : [],
            })
        for i_si, row_si in dataSubIndicatorC.iterrows():
            if(row['Names'] == row_si['Indicator'] and not math.isnan(row_si['Value'])):
                hier_hc[c]['series'][j]['data'].append(
                    {
                        'name' : row_si['Names'], 
                        'y' : row_si['Value'],
                        'drilldown' : row_si['Names']
                    }
                    )
        j = j + 1

# Drill to sub sub indicator level 

start_from = j 

dataSubSubIndicator = data[data['Levels'] == 'Sub-sub-indicator']
dataSubSubIndicatorMeans = dataSubSubIndicator.groupby(['Index_Name']).mean('Value') 
dataSubSubIndicatorMeans['Index_Name'] = dataSubSubIndicatorMeans.index
dataSubSubIndicatorMeans['Country'] = 'Overall'
dataSubSubIndicatorMeans['Levels'] = 'Sub-sub-indicator'
dataSubSubIndicatorMeans['Names'] = dataSubSubIndicatorMeans['Index_Name']
dataSubSubIndicatorMeans['Category'] = dataSubSubIndicatorMeans['Index_Name']

for c in countries: 
    dataSubIndicatorC = dataSubIndicator[dataSubIndicator['Country'] == c]
    dataSubSubIndicatorC = dataSubSubIndicator[dataSubSubIndicator['Country'] == c]
    # Sub Sub Indicator Level 

    j = start_from 
    
    for i, row in dataSubIndicatorC.iterrows():
        hier_hc[c]['series'].append({
            'name' : row['Names'],
            'id' : row['Names'],
            'data' : [],
            })
        for i_ssi, row_ssi in dataSubSubIndicatorC.iterrows():
            if(row['Names'] == row_ssi['Sub_Indicator'] and not math.isnan(row_ssi['Value'])):
                if(row['Names']  =="Completion of Primary Education"):
                    print(row_ssi)
                
                hier_hc[c]['series'][j]['data'].append(
                    [
                        row_ssi['Names'], 
                        row_ssi['Value']
                    ]
                    )
        j = j + 1

# Finally remove empty data - this removes cases where there is no sub sub indicator to drill down into 
for c in countries:
    hier_hc[c]['series'] = [item for item in hier_hc[c]['series'] if item['data'] != []]    

hier_hc_json = json.dumps(hier_hc)

with open('/Users/joejohnson/Documents/AFRICOM/webapp/index_scores/iiag/data_drilldown_hierarchy.js', 'w') as data_drilldown_hierarchy:
    data_drilldown_hierarchy.write('var data_drilldown_hierarchy = ' + hier_hc_json)    



with open('/Users/joejohnson/Documents/AFRICOM/webapp/index_scores/iiag/data_drilldown_hierarchy-view.txt', 'w') as data_drilldown_hierarchy:
    data_drilldown_hierarchy.write(json.dumps(hier_hc['Togo'], indent=4))    

