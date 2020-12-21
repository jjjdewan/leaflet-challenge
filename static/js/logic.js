// console.log("Step 2 working");


// Create tilelayer that will be will be used to select backgrounds of map using API_KEY
// One for our grayscale background.
//  Define graymap 
var myGrayMap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
  tileSize: 512,
  maxZoom: 18,
  zoomOffset: -1,
  id: "mapbox/light-v10",
  accessToken: API_KEY
});

// Define satellitemap
var mySatelliteMap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
  tileSize: 512,
  maxZoom: 18,
  zoomOffset: -1,
  id: "mapbox/satellite-v9",
  accessToken: API_KEY
});

//  Define outdoors map
var myOutdoorsMap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
  tileSize: 512,
  maxZoom: 18,
  zoomOffset: -1,
  id: "mapbox/outdoors-v11",
  accessToken: API_KEY
});

// Create map object from map  defination parameters and then define list of layers
// 
var myMap = L.map("mapid", {
  center: [
    40.7, -94.5
  ],
  zoom: 3,
  layers: [myGrayMap, mySatelliteMap, myOutdoorsMap]
});

// Add 'myGrayMap' tile layer to the map as default layer
//
myGrayMap.addTo(myMap);

// Define variable of for tectonic and earthquakes plates 
// 
var tectonicplates = new L.LayerGroup();
var earthquakes = new L.LayerGroup();

// Defining an object with key value pair holding different map choices that 
// can be selected by the user
// 
var baseMaps = {
  Satellite: mySatelliteMap,
  Grayscale: myGrayMap,
  Outdoors: myOutdoorsMap
};

// Define overlays object that can be used in combination for selcection 
//
var overlays = {
  "Tectonic Plates": tectonicplates,
  Earthquakes: earthquakes
};

// Enable control on the map so that user can select on which layers to be visible 
// for any visual check
// 
L
  .control
  .layers(baseMaps, overlays)
  .addTo(myMap);

// Using AJAX call to get earthquake geoJSON data
//
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson", function(data) {

  // Function to returns earthquakes data to be plotted to the map
  //
  function styleInfo(feature) {
    return {
      opacity: 1,
      fillOpacity: 1,
      fillColor: getColor(feature.geometry.coordinates[2]),
      color: "#000000",
      radius: getRadius(feature.properties.mag),
      stroke: true,
      weight: 0.5
    };
  }

  // Function to define the color marker that is based on the magnitude of the earthquake
  //
  function getColor(depth) {
    switch (true) {
    case depth > 90:
      return "#ea2c2c";
    case depth > 70:
      return "#ea822c";
    case depth > 50:
      return "#ee9c00";
    case depth > 30:
      return "#eecc00";
    case depth > 10:
      return "#d4ee00";
    default:
      return "#98ee00";
    }
  }

  // Function defining the radius of the earthquake marker based on magnitude
  // 
  function getRadius(magnitude) {
    if (magnitude === 0) {
      return 1;
    }

    return magnitude * 4;
  }

  // Incorporate a GeoJSON layer to the map once data is loaded
  //
  L.geoJson(data, {
    // create a feature to a circleMarker on the map
    pointToLayer: function(feature, latlng) {
      return L.circleMarker(latlng);
    },
    // set the style for circleMarker using our styleInfo function
    style: styleInfo,

    // Create a Popup for each marker to display the magnitude and location of
    // the earthquake with earthquake magnitude, coordinate and place name
    //
    onEachFeature: function(feature, layer) {
      layer.bindPopup(
        "Magnitude: "
          + feature.properties.mag
          + "<br>Depth: "
          + feature.geometry.coordinates[2]
          + "<br>Location: "
          + feature.properties.place
      );
    }
    // Add earthquake data to earthquake layer 
  }).addTo(earthquakes);

  // Now, add earthquake layer to the map
  earthquakes.addTo(myMap);

  // Create legend control object with position 
  //
  var legend = L.control({
    position: "bottomright"
  });

  // Add information to legend object with eathquake garde and colors scale
  //
  legend.onAdd = function() {
    var div = L.DomUtil.create("div", "info legend");
    var grades = [-10, 10, 30, 50, 70, 90];
    var colors = [
      "#98ee00",
      "#d4ee00",
      "#eecc00",
      "#ee9c00",
      "#ea822c",
      "#ea2c2c"];

    
    // Go through each intervals and create label for each 
    //
    for (var i = 0; i < grades.length; i++) {
      div.innerHTML += "<i style='background: "
        + colors[i]
        + "'></i> "
        + grades[i]
        + (grades[i + 1] ? "&ndash;" + grades[i + 1] + "<br>" : "+");
    }
    return div;
  };

  // Add legend to the map
  //
  legend.addTo(myMap);

  // Making an AJAX call to get Tectonic Plate geoJSON data
  //
  d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json",
    function(platedata) {
      // Using geoJason to  add platedata to tectonicplates layer
      // 
      L.geoJson(platedata, {
        color: "orange",
        weight: 2
      })
      .addTo(tectonicplates);

      // Adding tectonicplates layer to the map
      tectonicplates.addTo(myMap);
    });
});
