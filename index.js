import { hospitals } from "./data/hospitals.js"
import { addingSignalsHandler } from "./functions/addingSignalHandler.js"


const  country  = addingSignalsHandler()

var map = L.map('map', {doubleClickZoom: false});

//Layers
// Open street map
var osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
	maxZoom: 19,
	  opacity:0.6,

	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map)

// google
var google = L.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',{
  maxZoom: 20,
  opacity:0.6,
  subdomains:['mt0','mt1','mt2','mt3'],
 })
        
        // =============== Weather Layers ================= //

   var rain = L.OWM.rainClassic({showLegend: true, opacity: 0.5, appId: '8620e3d54164645551d0015414ab3638'});
   var clouds = L.OWM.cloudsClassic({showLegend: true, opacity: 0.5, appId: '8620e3d54164645551d0015414ab3638'});
   var temperature = L.OWM.temperature({showLegend: true, opacity: 0.5, appId: '8620e3d54164645551d0015414ab3638'});
   var wind = L.OWM.wind({showLegend: true, opacity: 0.5, appId: '8620e3d54164645551d0015414ab3638'});
   var precipitationcls  = L.OWM.precipitationClassic({showLegend: true, opacity: 0.5, appId: '8620e3d54164645551d0015414ab3638'});


 
//================ geojson layers ================ //
        //* Admin1 Layer
        var geojsonLayer = L.geoJson(country.adm1, { 
            style: (feature) =>  style(feature), 
            onEachFeature: (feature, layer) => { 
                layer.on({
                    mouseover:(e) => highlightFeature(e),
                    mouseout: (e) => resetHighlight(e),
                    click: (e) => drillDown(e),
                });
            }
          }).addTo(map)
        
          // Fitting the map within country bounds
          var bounds = geojsonLayer.getBounds();
          map.fitBounds(bounds); 
        //   map.options.maxBounds = bounds;
        //   map.options.maxBoundsViscosity = 1.0;
        
            //* Admin2 Layer
            var geojsonLayer2 = L.geoJson(country.adm2, { 
              style:  (feature) =>  style(feature), 
              onEachFeature: (feature, layer) => { 
                  layer.on({
                      mouseover:(e) => highlightFeature(e),
                      mouseout: (e) => resetHighlight(e),
                  });
              }
            })

  //================= utility functions =====================//
function getColor(d) {
     
    const maxSignal = country.adm1.features.reduce((max, feature) => {
      return Math.max(max, feature.properties.signal);
    }, 0); 
    const colors =  ['#690603','#790c0c', '#940f0f', '#af1616', '#c92f2f', '#d35151',  '#db7070', '#db7070','#f3d9d9', '#e0d1d1'];
    const normalizedValue = 1 - (d / maxSignal);  
    const colorIndex = Math.floor(normalizedValue * (colors.length - 1));
  
    return colors[colorIndex];
  }

  function style(feature) {
   
    return  {
       fillColor: getColor(feature.properties.signal),
       weight: 2,
       opacity: 1,
       color: 'white',
       dashArray: '3',
       fillOpacity: 0.7
       
   };
 }
 function highlightFeature(e) {
    var layer = e.target;
    layer.setStyle({
        weight: 5,
        color: '#666',
        dashArray: '',
        fillOpacity: 0.7
    });
    layer.bringToFront();
    info.update(layer.feature.properties);
  }
function resetHighlight(e) {
    geojsonLayer.resetStyle(e.target);
    info.update();
}
function zoomToFeature(e) {
    map.fitBounds(e.target.getBounds());
}
function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: zoomToFeature
    });
}


//============ info board ==================//
var info = L.control();
info.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
    this.update();
    return this._div;
};

// method that we will use to update the control based on feature properties passed
info.update = function (props) {
    this._div.innerHTML = '<h4>Signals</h4>' +  (props ?
        '<b>' + props.ADM1_NAME + '</b><br />' + props.signal + ' signals'
        : 'Hover over a state');
};

info.addTo(map);

//========= control tree ============//

var baseTree = [
    { 
      label: "<span style='font-size: 16px;margin-left: 5px;color:#A22020; font-weight: 800'>Base maps</span>",
      children: [
       {label: "<span style='font-size: 14px;margin-left: 5px;'>Google</span>",layer: google, name:'google'},
       {label: "<span style='font-size: 14px;margin-left: 5px;'>Open street map</span>",layer: osm, name:'osm'}
      ]
     },
  
   ]
   var overlaysTree = {
     label:  "<span style='font-size: 16px;margin-left: 5px;color:#A22020; font-weight: 800'>Overlays</span>",
     children: [
          {
           label:  "<span style='font-size: 16px;margin-left: 5px;color:#108710; font-weight: 600'>Weather Layers &#9729; </span>",
           selectAllCheckbox: true,
           children: [
             {label:  "<span style='font-size: 14px; margin-left: 5px;'>Clouds</span>", layer: clouds},
             {label:  "<span style='font-size: 14px; margin-left: 5px;'>Rain</span>", layer: rain},
             {label:  "<span style='font-size: 14px; margin-left: 5px;'>Wind</span>", layer: wind},
             {label:  "<span style='font-size: 14px; margin-left: 5px;'>Temperature</span>", layer: temperature},
             {label:  "<span style='font-size: 14px; margin-left: 5px;'>Precipitation</span>", layer: precipitationcls},
           ]
          },
          {
           label:  "<span style='font-size: 16px;margin-left: 5px;color:#108710; font-weight: 600'>Health Facilities &#127973;</span>",
           selectAllCheckbox: false,
           children: [
             { label: "<span style='font-size: 14px; margin-left: 5px;'>Hospitals</span>", layer: healthFacilitiesLayer }
           ]
          }
     ]
   }
   var drawnItems = L.featureGroup().addTo(map);


    //=== health layer ======//
    // health
var myIcon = L.icon({
  iconUrl: '/images/hospital.png',
  iconSize: [38, 38],
  iconAnchor: [22, 48],
  popupAnchor: [-3, -40],
});
var healthFacilitiesLayer = L.layerGroup();

    hospitals.map(facility => {
    var marker = L.marker([facility.Latitude, facility.Longitude], {icon: myIcon}).bindPopup(facility.name)
    healthFacilitiesLayer.addLayer(marker);
   });
   const healthFacilitiesSection = overlaysTree.children.find(section => section.label.includes('Health Facilities'));

   // Add to the Health Facilities section
   if (healthFacilitiesSection) {
    const hospitalsEntry = healthFacilitiesSection.children[0]; 
    hospitalsEntry.layer = healthFacilitiesLayer;
   }
// layertree control
   var lay = L.control.layers.tree(baseTree, overlaysTree, {collapsed: true});
   lay.addTo(map)
  //====== Draw controls ======//
    L.control.layers({ }, { 'drawlayer': drawnItems }, { position: 'topleft', collapsed: false }).addTo(map);

    map.addControl(new L.Control.Draw({
        edit: {
            featureGroup: drawnItems,
            poly: {
                allowIntersection: false
            }
        },
        draw: {
            polygon: {
                allowIntersection: false,
                showArea: true
            }
        }
    }));

    map.on(L.Draw.Event.CREATED, function (event) {
        var layer = event.layer;

        drawnItems.addLayer(layer);
    });





// Assuming your layers are defined as variables like osm, google, rain, clouds, etc.

//============ Create a control with two dropdowns for selecting layers ===========//
const LayerControl = L.Control.extend({
  options: {
      position: 'topright',
      layers:{}
  },

  onAdd: function (map) {
      const container = L.DomUtil.create('div', 'layer-control');
      L.DomUtil.addClass(container, 'leaflet-bar');

      const selectLeft = L.DomUtil.create('select', 'layer-select', container);
      const selectRight = L.DomUtil.create('select', 'layer-select', container);

      // Helper function to populate select elements
      const addOption = (select, layer, name) => {
          const option = document.createElement('option');
          option.value = name;
          option.textContent = name;
          select.appendChild(option);
          this.options.layers[name] = layer; // Store layer reference in control options
      };

      // Add options to both selects
      // addOption(selectLeft, osm, 'OSM');
      // addOption(selectLeft, google, 'Google');
      addOption(selectLeft, rain, 'Rain');
      addOption(selectLeft, clouds, 'Clouds');
      addOption(selectLeft, wind, 'Wind');
      addOption(selectLeft, temperature, 'Temperature');
      addOption(selectLeft, precipitationcls, 'Precipitation');

      // addOption(selectRight, osm, 'OSM');
      // addOption(selectRight, google, 'Google');
      addOption(selectRight, rain, 'Rain');
      addOption(selectRight, clouds, 'Clouds');
      addOption(selectRight, wind, 'Wind');
      addOption(selectRight, temperature, 'Temperature');
      addOption(selectRight, precipitationcls, 'Precipitation');

      var sideBySideControl;
      // Listen for changes and update the Side By Side control
      const updateSideBySide = () => {
          if (sideBySideControl) {
              map.removeControl(sideBySideControl);
          }
          const leftLayer = this.options.layers[selectLeft.value];
          const rightLayer = this.options.layers[selectRight.value];
          sideBySideControl = L.control.sideBySide(leftLayer, rightLayer).addTo(map);
      };

      selectLeft.onchange = updateSideBySide;
      selectRight.onchange = updateSideBySide;

      return container;
  },

  onRemove: function (map) {
      // Clean up when the control is removed
      if (sideBySideControl) {
          map.removeControl(sideBySideControl);
      }
  }
});

// Add this new control to the map
map.addControl(new LayerControl());
var newGeojsonLayer;
function drillDown(e) {
   
  //  checking and removing geojson layer
   if (geojsonLayer) {
     map.removeLayer(geojsonLayer);
   }
  // creating city geojson
    const clickedCityCode = e.target.feature.properties.admin2_codes

    const cityFeatures = country.adm2.features.filter(feature => feature.properties.admin2_codes === clickedCityCode)
  
   const cityGeojson = { type : 'FeatureCollection', features: cityFeatures}
  // setting bounds
    const bounds = e.target.getBounds();
//* ADM2 Map
   newGeojsonLayer = L.geoJson(cityGeojson, { 
    style: style, 
    onEachFeature: (feature, layer) => { 
      const popupContent = '<b>' + feature.properties.ADM2_NAME + '</b><br />' + 
      feature.properties.signal + ' signals'; 
      // Bind popup and hover events
      const popupOptions = { offset: [0, -10] }
      layer.bindPopup(popupContent, popupOptions);
      let hoveredStateId = null;
        layer.on({
          mouseover: (e) => {   
            hoveredStateId = feature.properties.ADM2_CODE;
            e.target.openPopup(); 
            highlightFeature(e);  
        },
        mouseout: (e) => {
          hoveredStateId = null;
          if(!layer.isPopupOpen()){
            resetHighlight(e); 
          }
         
        },
        popupopen: function(e) {
          // Optionally highlight again (in case a different popup was open)
          highlightFeature(e);  
      }, 
      popupclose: (e) =>  resetHighlight(e)
        });
    }
  }).addTo(map);

   map.fitBounds(bounds);
 
}

    // adding a toggle button 
   
    function toggleSidebyside() {
      map.removeLayer(newGeojsonLayer)
      map.fitBounds(bounds);
      map.addLayer(geojsonLayer)
    }
    var toggleButton = L.DomUtil.create('button', 'toggle-button'); 
    toggleButton.innerHTML = 'Return';
    toggleButton.addEventListener('click',() =>  toggleSidebyside());
    
    var resetControl = L.control({ position: 'topright' }); 
    
    resetControl.onAdd = function (map) {
       return toggleButton;
    };
    
    resetControl.addTo(map);

    
      // =============== Geojson Layers Control ===============//
      let admin1Layer = geojsonLayer ; 
      let admin2Layer = geojsonLayer2 ; 
  
      const CustomControl = L.Control.extend({
        options: {
            position: 'topright' // Or another suitable position
        },
    
        onAdd: function (map) {
          const container = L.DomUtil.create('div', 'custom-control');
          container.innerHTML = ` 
              <input type="checkbox" id="admin1-checkbox" name="admin1Layer" checked>
              <label style='margin-bottom: 5px;' for="admin1-checkbox">Admin 1</label><br>
              <input type="checkbox" id="admin2-checkbox" name="admin2Layer">
              <label for="admin2-checkbox">Admin 2</label> 
          `;
  
        
          L.DomEvent.on(container.querySelector('#admin1-checkbox'), 'change', () => {
           if(map.hasLayer(admin1Layer)){
             map.removeLayer(admin1Layer)
           } else {
            map.addLayer(admin1Layer)
           }
      });
  
          L.DomEvent.on(container.querySelector('#admin2-checkbox'), 'change', () => {
            if(map.hasLayer(admin2Layer)){
              map.removeLayer(admin2Layer)
            } else {
             map.addLayer(admin2Layer)
            }
          });
  
          L.DomEvent.disableClickPropagation(container); 
          return container;
        }
    });
    // Add the control to the map
    const customControl = new CustomControl().addTo(map); 

    //===== right-click action ========//
    map.on('contextmenu', (e) => {
      e.originalEvent.preventDefault();
      map.removeLayer(newGeojsonLayer)
      map.fitBounds(bounds);
      map.addLayer(geojsonLayer)
  });