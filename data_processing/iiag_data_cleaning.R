# Mo Ibrahim African Governance Dashboard 

# Read in and clean data 
library(tidyverse)
library(readxl)
library(jsonlite)
library(glue)
setwd("~/Documents/GitHub/IIAG/data_processing/")
data <- read_excel("2022-IIAG-scores.xlsx",
                   skip = 7,
                   col_names = FALSE
)
colnames_data <- read_excel("2022-IIAG-scores.xlsx")
names(data) <- c("Country", "Year", as.character(unlist(colnames_data[3,]))[-1:-2])

# Convert characters to numeric (character occurs when a period symbol is used to indicate missingness)
# Periods here will just get converted to NA, which is the desired result
data <- data %>% group_by(Country) %>% mutate_if( is.character, as.numeric)

data_long <- data %>% 
  group_by() %>% 
  pivot_longer(!c(Country, Year),  names_to = "Index_Code", values_to = "Value")

# Add names
codes_to_names <- data.frame(
  Index_Code = as.character(unlist(colnames_data[3, -1:-2])),
  Index_Source = as.character(unlist(colnames_data[5, -1:-2])),
  Index_Name = as.character(unlist(colnames_data[4, -1:-2]))
)

data_long <- data_long %>% left_join(codes_to_names, by = c("Index_Code" = "Index_Code"))

# Get column names from first part of dataset 

# Fix sub sub indicator names where they repeat
data_long <- data_long %>% mutate(
  Index_Name = 
    case_when(Index_Code %in% 
                c("AbsCorrJudVDEM", "AbsCorrJudWJP",
                  "AbsCorrLegVDEM", "AbsCorrLegWJP",
                  "BusRegEnvAfDB", "BusRegEnvWB",
                  "EffRevMobAfDB", "EffRevMobWB",
                  "EnPolRegAfDB", "EnPolRegWB",
                  "EqPubResAfDB", "EqPubResWB",
                  "QualPubAdminAfDB", "QualPubAdminWB",
                  'SocProtLabLawAfDB', "SocProtLabLawWB",
                  "WelfPolSerAfDB", "WelfPolSerWB") ~ glue("{Index_Name} ({Index_Source})"),
              TRUE ~ Index_Name)
) 

# Map Indexes to one another - go down to indicator level for now 
levels_mapping <- tibble(
  Levels = as.character(unlist(colnames_data[2,]))[-1:-2],
  Index_Code = as.character(unlist(colnames_data[3,]))[-1:-2],
  Names = as.character(unlist(colnames_data[4,]))[-1:-2],
  Index_Source = as.character(unlist(colnames_data[5, -1:-2]))
) %>% mutate(
  Names = 
    case_when(Index_Code %in% 
                c("AbsCorrJudVDEM", "AbsCorrJudWJP",
                  "AbsCorrLegVDEM", "AbsCorrLegWJP",
                  "BusRegEnvAfDB", "BusRegEnvWB",
                  "EffRevMobAfDB", "EffRevMobWB",
                  "EnPolRegAfDB", "EnPolRegWB",
                  "EqPubResAfDB", "EqPubResWB",
                  "QualPubAdminAfDB", "QualPubAdminWB",
                  'SocProtLabLawAfDB', "SocProtLabLawWB",
                  "WelfPolSerAfDB", "WelfPolSerWB") ~ glue("{Names} ({Index_Source})"),
              TRUE ~ Names)
) 

levels_mapping_cleaned <- levels_mapping %>% 
  # Category
  mutate(Category = case_when(
    Levels == "Category" ~ Names,
    Levels == "Overall" ~ "OVERALL GOVERNANCE",
    TRUE ~ NA_character_),
    Index_Code_Category = case_when(
      Levels %in% c("Overall", "Category") ~ Index_Code,
      TRUE ~ NA_character_    
  )
  ) %>% fill(Category) %>% fill(Index_Code_Category) %>% 
  # Sub Category
  mutate(Sub_Category = case_when(
    Levels == "Sub-category" ~ Names,
    TRUE ~ NA_character_
  ),
  Index_Code_Sub_Category = case_when(
    Levels == "Sub-category" ~ Index_Code,
    TRUE ~ NA_character_    
  )
  ) %>% fill(Sub_Category) %>% fill(Index_Code_Sub_Category) %>% 
  # Indicator
  mutate(Indicator = case_when(
    Levels == "Indicator" ~ Names,
    TRUE ~ NA_character_),
    Index_Code_Indicator = case_when(
      Levels == "Indicator" ~ Index_Code,
      TRUE ~ NA_character_    
    )
  ) %>% fill(Indicator) %>% fill(Index_Code_Indicator) %>% 
  # Sub Indicator
  mutate(Sub_Indicator = case_when(
    Levels == "Sub-indicator" ~ Names,
    TRUE ~ NA_character_
  ),
  Index_Code_Sub_Indicator = case_when(
    Levels == "Sub-indicator" ~ Index_Code,
    TRUE ~ NA_character_    
  )
  ) %>% fill(Sub_Indicator) %>% fill(Index_Code_Sub_Indicator) %>% 
  # Sub Sub Indicator
  mutate(Sub_Sub_Indicator = case_when(
    Levels == "Sub-sub-indicator" ~ Names,
    TRUE ~ NA_character_
  ),
  Index_Code_Sub_Sub_Indicator = case_when(
    Levels == "Sub-sub-indicator" ~ Index_Code,
    TRUE ~ NA_character_    
  )
  )
levels_mapping_cleaned <- levels_mapping_cleaned %>% mutate(
  Indicator = ifelse(Levels %in% c("Sub-category"), NA, Indicator),
  Sub_Indicator = ifelse(Levels %in% c("Indicator", "Sub-category"), NA, Sub_Indicator),
  Sub_Sub_Indicator = ifelse(Levels %in% c("Sub-indicator", "Indicator", "Sub-category"), NA, Sub_Sub_Indicator),
  
  Index_Code_Sub_Category = ifelse(is.na(Sub_Category), NA, Index_Code_Sub_Category), 
  Index_Code_Indicator = ifelse(is.na(Indicator), NA, Index_Code_Indicator),
  Index_Code_Sub_Indicator = ifelse(is.na(Sub_Indicator), NA, Index_Code_Sub_Indicator),
  Index_Code_Sub_Sub_Indicator = ifelse(is.na(Sub_Sub_Indicator), NA, Index_Code_Sub_Sub_Indicator)
) 

# data 
iiag_data_long <- data_long %>% left_join(levels_mapping_cleaned)

iso3 <- read_excel("iso3-codes.xlsx")
iiag_data <- iiag_data_long %>% left_join(iso3, by = c("Country" = "Country"))

# Encoding causes problems with these countries... can't figure out a fix, so 
# For now I fix this manually 
iiag_data <- iiag_data %>% mutate(ISO3 = case_when(
  Country == "Burkina Faso" ~ "BFA",
  Country == "Cabo Verde" ~ "CPV",
  Country == "Central African Republic" ~ "CAF",
  Country == "Congo Republic" ~ "COG",
  Country == "Côte d'Ivoire" ~ "CIV",
  Country == "DR Congo" ~ "COD",
  Country == "Equatorial Guinea" ~ "GNQ",
  Country == "São Tomé and Príncipe" ~ "STP",
  Country == "Sierra Leone" ~ "SLE",
  Country == "South Africa" ~ "ZAF",
  Country == "South Sudan" ~ "SSD",
  TRUE ~ ISO3
  )
)

# Generate groupings 
country_groups <- read_csv("country_groupings_iiag.csv")
country_groups <- country_groups %>% select(-Country)

iiag_data <- iiag_data %>% inner_join(country_groups, by = c("ISO3" = "ISO3"))
# Remove IIAG specific regional data - only use the AFRICOM/UN/AU ones
iiag_data <- iiag_data %>% select(-IIAG_Region, -Geographical, SubSaharan)


# Generate change from last year 
iiag_data <- iiag_data %>% 
  group_by(Index_Code, Country) %>% 
  arrange(Index_Code, Country, Year) %>% 
  mutate(Value_Change = Value - lag(Value))

iiag_data <- iiag_data %>% group_by(Index_Code, Year) %>% arrange(Value) %>% mutate(Rank = min_rank(-Value))


iiag_data %>% 
  filter(Category == "PARTICIPATION, RIGHTS & INCLUSION", Sub_Category == "INCLUSION & EQUALITY", 
         Indicator == "Equal Civil Liberties", 
         Sub_Indicator == "Equality in Civil Liberties by Income Level",
         Year == 2021, Levels == "Sub-indicator") %>% View()

# Create numeric ordering 
iiag_data <- iiag_data %>% group_by(Index_Code_Category) %>% mutate(index = cur_group_id()) 
iiag_data <- iiag_data %>% group_by(Index_Code_Category, Index_Code_Sub_Category) %>% 
  mutate(index2 = ifelse(is.na(Index_Code_Sub_Category), 0, cur_group_id()))
iiag_data <- iiag_data %>% group_by(Index_Code_Category, Index_Code_Sub_Category, Index_Code_Indicator) %>% 
  mutate(index3 = ifelse(is.na(Index_Code_Indicator), 0, cur_group_id())) 
iiag_data <- iiag_data %>% group_by(Index_Code_Category, Index_Code_Sub_Category, Index_Code_Indicator, Index_Code_Sub_Indicator) %>% 
  mutate(index4 = ifelse(is.na(Index_Code_Sub_Indicator), 0, cur_group_id())) 
iiag_data <- iiag_data %>% group_by(Index_Code_Category, Index_Code_Sub_Category, Index_Code_Indicator, Index_Code_Sub_Indicator, Index_Code_Sub_Sub_Indicator) %>% 
  mutate(index5 = ifelse(is.na(Index_Code_Sub_Sub_Indicator), 0, cur_group_id())) 

iiag_data <- iiag_data %>% 
  mutate(index_vals = index * 100 + index2 + index3 / 1000) %>% 
  select(-index, -index2, -index3, -index4, -index5)

save(iiag_data, file = "./../../../AFRICOM/IIAG/clean_iiag_data.RData")
write_csv(iiag_data, file = "./../../../AFRICOM/IIAG/clean_iiag_data.csv")
write_csv(levels_mapping_cleaned, file = "./../../../AFRICOM/IIAG/iiag_mapping.csv")

# Output as JSON file 

load("./../../../AFRICOM/IIAG/clean_iiag_data.RData")

# Write to JSON - remove extraneous columns to keep size down
iiag_data %>% 
  group_by() %>% 
  select(
    -Index_Code, 
    -Index_Source,
    -Index_Code_Category, 
    -Index_Code_Sub_Category,
    -Index_Code_Sub_Indicator,
    -Index_Code_Sub_Sub_Indicator,
    -SubSaharan
  ) %>% 
write_json(path = "./../index_scores/iiag/iiag.js")


fConn <- file( "./../index_scores/iiag/iiag.js", 'r+')
Lines <- readLines(fConn)
writeLines(c("var iiag = ", Lines), con = fConn)
close(fConn)

# Create hierarchy JSONs 

# Sub categories 
sub_category_mapping <- iiag_data %>% filter(Levels == "Sub-category") %>% 
  group_by(Category, Sub_Category) %>% summarize() 

sub_category_mapping_list <- list()

categories <- unique(sub_category_mapping$Category)
for(c in categories){
  sub_categories <- sub_category_mapping %>% filter(Category == c)
  sub_category_mapping_list[[c]] <- sub_categories$Sub_Category
}

write_json(sub_category_mapping_list, path = "./../index_scores/iiag/category_to_sub_category.js")

fConn <- file( "./../index_scores/iiag/category_to_sub_category.js", 'r+')
Lines <- readLines(fConn)
writeLines(c("var category_to_sub_category = ", Lines), con = fConn)
close(fConn)

# Indicators 
indicator_mapping <- iiag_data %>% filter(Levels == "Indicator") %>% group_by(Sub_Category, Indicator) %>% summarize() 

indicator_mapping_list <- list()

sub_categories <- unique(indicator_mapping$Sub_Category)
for(sc in sub_categories){
  indicators <- indicator_mapping %>% filter(Sub_Category == sc)
  indicator_mapping_list[[sc]] <- indicators$Indicator
}

write_json(indicator_mapping_list, path = "./../index_scores/iiag/sub_category_to_indicator.js")

fConn <- file( "./../index_scores/iiag/sub_category_to_indicator.js", 'r+')
Lines <- readLines(fConn)
writeLines(c("var sub_category_to_indicator = ", Lines), con = fConn)
close(fConn)

# sub indicators mapping 
sub_indicator_mapping <- iiag_data %>% filter(Levels == "Sub-indicator") %>% 
  group_by(Category, Sub_Category, Indicator, Sub_Indicator) %>% summarize() 

sub_indicator_mapping_list <- list()

indicators <- unique(sub_indicator_mapping$Indicator)
for(i in indicators){
  sub_indicators <- sub_indicator_mapping %>% filter(Indicator == i)
  sub_indicator_mapping_list[[i]] <- sub_indicators$Sub_Indicator
}
write_json(sub_indicator_mapping_list, path = "./../index_scores/iiag/indicator_to_sub_indicator.js")

fConn <- file( "./../index_scores/iiag/indicator_to_sub_indicator.js", 'r+')
Lines <- readLines(fConn)
writeLines(c("var indicator_to_sub_indicator = ", Lines), con = fConn)
close(fConn)

# sub sub indicators mapping 
sub_sub_indicator_mapping <- iiag_data %>% filter(Levels == "Sub-sub-indicator") %>% 
  group_by(Category, Sub_Category, Indicator, Sub_Indicator, Sub_Sub_Indicator, Index_Code) %>% summarize() 

sub_sub_indicator_mapping_list <- list()


sub_indicators <- unique(sub_sub_indicator_mapping$Sub_Indicator)
for(si in sub_indicators){
  sub_sub_indicators <- sub_sub_indicator_mapping %>% filter(Sub_Indicator == si)
  sub_sub_indicator_mapping_list[[si]] <- sub_sub_indicators$Sub_Sub_Indicator
}

write_json(sub_sub_indicator_mapping_list, path = "./../index_scores/iiag/sub_indicator_to_sub_sub_indicator.js")

fConn <- file( "./../index_scores/iiag/sub_indicator_to_sub_sub_indicator.js", 'r+')
Lines <- readLines(fConn)
writeLines(c("var sub_indicator_to_sub_sub_indicator = ", Lines), con = fConn)
close(fConn)


# Produce comma separated country names 
# country_groups <- read_csv("country_groupings_iiag.csv")
# country_groups %>% group_by(AC_Region) %>% arrange(AC_Region, Country) %>% summarize(text_output = paste0(Country, collapse = ", "))
# country_groups %>% group_by(AC_Regional_Division) %>% arrange(AC_Regional_Division, Country) %>% summarize(text_output = paste0(Country, collapse = ", "))
# country_groups %>% group_by(UN_Region) %>% arrange(UN_Region, Country) %>% summarize(text_output = paste0(Country, collapse = ", "))
# country_groups %>% group_by(AU_Region) %>% arrange(AU_Region, Country) %>% summarize(text_output = paste0(Country, collapse = ", "))

