import {ug_adm1} from "../geojson/ug_adm1.js"
import {ug_adm2} from "../geojson/ug_adm2.js"
import {admin1_codes, admin1_counts, admin2_codes, admin2_counts} from "../data/ugandaData.js"


export function addingSignalsHandler(){
    var country = {
        name: 'UGANDA',
        adm1: ug_adm1,
        adm2: ug_adm2
    }
    const properties = admin1_codes.reduce((acc,city,index) => {
      acc[city] = admin1_counts[index]
      return acc
  }, {})
  
  country.adm1.features.forEach(feature => {
  const cityCode = feature.properties.ADM1_CODE
  
  if(cityCode in properties) {
  Object.defineProperty(feature.properties, 'signal', {
  value: properties[cityCode],  // Set your signal value 
  writable: true,              
  enumerable: true,  
  configurable: true 
  });
  
  } else {
  Object.defineProperty(feature.properties, 'signal', {
  value: 0,  // Set your signal value 
  writable: true,              
  enumerable: true,  
  configurable: true 
  });
  }
  })
  if(country.adm2){
    const d_properties = admin2_codes.reduce((acc,district,index) => {
      acc[district] = admin2_counts[index]
      return acc
  }, {})
  
  country.adm2.features.forEach(feature => {
  const cityName = feature.properties.ADM2_CODE
  
  if(cityName in d_properties) {
  Object.defineProperty(feature.properties, 'signal', {
  value: d_properties[cityName],  // Set your signal value 
  writable: true,              
  enumerable: true,  
  configurable: true 
  });
  
  } else {
  Object.defineProperty(feature.properties, 'signal', {
  value: 0,  // Set your signal value 
  writable: true,              
  enumerable: true,  
  configurable: true 
  });
  }})
  }

  return country
  }