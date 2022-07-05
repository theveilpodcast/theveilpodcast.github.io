const containerFilteredResults = document.getElementById("filtered-results");
const newContainerLayerControl1 = document.getElementById(
  "container-layer-control-1"
);
const newContainerLayerControl2 = document.getElementById(
  "container-layer-control-2"
);
const newContainerLayerControlDirectExchange = document.getElementById(
  "container-direct-exchange"
);

const newContainerTilesControl = document.getElementById(
  "container-tiles-layer-control"
);

let map = L.map("map", {
  fullScreenControl: true,
  zoomSnap: 0.5,
  attributionControl: false,
});

const startCoordinates = [35.9737226, -80.001758];
const startZoom = 15.5;

map.setView(startCoordinates, startZoom);

let tiles_OSM = L.tileLayer(
  "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw",
  {
    maxZoom: 18,
    attribution:
      'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, ' +
      'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    id: "mapbox/streets-v11",
    tileSize: 512,
    zoomOffset: -1,
  }
).addTo(map);

let tiles_Esri_WorldImagery = L.tileLayer(
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  {
    attribution: "Tiles &copy; Esri &mdash;",
  }
);

let sidebarControlMenu = L.control.sidebar("sidebar-control-menu", {
  position: "right",
  closeButton: false,
  autoPan: false,
});
map.addControl(sidebarControlMenu);
sidebarControlMenu.show();

const fsControl = L.control.fullscreen();
map.addControl(fsControl);

L.easyButton(
  '<span class="star" style="padding:0px;">&starf;</span>',

  function (btn, map) {
    map.setView(startCoordinates, startZoom);
  },
  "Default View"
).addTo(map);

let styleUniversityOutline = {
  color: "#333333",
  fillColor: "#a8a4a4",
  fillOpacity: 0.3,
  opacity: 1,
  weight: 0.5,
};

let fillColorsPallete = {
  0: "#ffbb00",
  1: "#ff6200",
  2: "#cc0300",
  3: "#9e0be6",
};

function customCircleMarkerEntity1(i) {
  return {
    color: "#000000",
    fillColor: fillColorsPallete[i],
    fillOpacity: 1,
    opacity: 1,
    radius: 8,
    weight: 2,
  };
}

function customCircleMarkerEntity2(i) {
  return {
    color: "#ffffff",
    fillColor: fillColorsPallete[i],
    fillOpacity: 1,
    opacity: 1,
    radius: 8,
    weight: 2,
  };
}

let customCircleMarkerDirectExchange = {
  color: "#000000",
  fillColor: "#ffffff",
  fillOpacity: 0,
  opacity: 1,
  weight: 1,
  radius: 50
};

function onEachFeature(feature, layer) {
  let propertyAddress = feature.properties["Location Address"];
  let propertyREID = feature.properties["REID"];
  let propertyDeedDate = feature.properties["Deed Date"];

  let popupContent = '<p class="popup-text-name">' + propertyAddress + "</p>";

  if (propertyREID) {
    popupContent += '<p class="popup-text-type">REID: ' + propertyREID + "</p>";
  }

  if (propertyDeedDate) {
    popupContent +=
      '<p class="popup-text-other">Deed Date: ' + propertyDeedDate + "</p>";
  }

  layer.bindPopup(popupContent, {
    className: "custom",
    closeButton: true,
  });

  layer.on({
    click: printPropertyHistory,
  });
}

function onlyUnique(value, index, self) {
  return self.indexOf(value) === index;
}

let layerUniversityOutline = L.geoJSON(geojsonUniversityOutline, {
  style: styleUniversityOutline,
}).addTo(map);

// -------------HANDLE DIRECT EXCHANGE -------------
let layerDirectExchange2 = L.geoJson(geojsonPointsProperties2, {
  filter: function (feature, layer) {
    if (feature.properties["Owner Name"] === "LILY PAD INVESTORS LLC")
      return true;
  },
  pointToLayer: function (feature, latlng) {
    return L.circle(latlng, customCircleMarkerDirectExchange);

  },
});

let layerDirectExchange1 = L.geoJson(geojsonPointsProperties1, {
  filter: function (feature, layer) {
    if (feature.properties["Owner Name"] === "HIGH POINT UNIVERSITY")
      return true;
  },
  pointToLayer: function (feature, latlng) {
    return L.circle(latlng, customCircleMarkerDirectExchange);
  },
});

let layerGroupDirectExchange = L.featureGroup([
  layerDirectExchange1,
  layerDirectExchange2,
]).addTo(map);

let overlaysDirectExchange = {
  "Direct Exchange Properties": layerGroupDirectExchange,
};

let layerControlDirectExchange = L.control
  .layers({}, overlaysDirectExchange, {
    collapsed: false,
  })
  .addTo(map);

// -------------HANDLE ENTITY 1-------------
let listYearsEntity1 = [];

// filter to remove duplicate points
let filteredLastDeedsEntity1 = geojsonPointsProperties1.features.filter(
  (feat) => feat.properties["Unnamed: 0"] === "Current"
);

filteredLastDeedsEntity1.forEach((feat) =>
  listYearsEntity1.push(feat.properties["Deed Date"].slice(-4))
);

// filter to keep just unique years
let listUniqueYearsEntity1 = listYearsEntity1.filter(onlyUnique).sort();

let overlaysEntity1 = {};

let layerControlEntity1 = L.control
  .layers({}, overlaysEntity1, {
    collapsed: false,
  })
  .addTo(map);

// generate a new map layer for each unique year
listUniqueYearsEntity1.forEach((year) => {
  newLayer = L.geoJson(geojsonPointsProperties1, {
    filter: function (feature, layer) {
      if (
        feature.properties["Unnamed: 0"] === "Current" &&
        feature.properties["Deed Date"].includes(year)
      )
        return true;
    },
    pointToLayer: function (feature, latlng) {
      return L.circleMarker(
        latlng,
        customCircleMarkerEntity1(parseInt(year) % 4)
      );
    },
    onEachFeature: onEachFeature,
  }).addTo(map);
  layerControlEntity1.addOverlay(newLayer, `Lily Pad Investors LLC - ${year}`);
});

// -------------HANDLE ENTITY 2-------------
let listYearsEntity2 = [];

// filter to remove duplicate points
let filteredLastDeedsEntity2 = geojsonPointsProperties2.features.filter(
  (feat) => feat.properties["Unnamed: 0"] === "Current"
);

filteredLastDeedsEntity2.forEach((feat) =>
  listYearsEntity2.push(feat.properties["Deed Date"].slice(-4))
);

// filter to keep just unique years
// also filter to remove deed dates < 2005
let listUniqueYearsEntity2 = listYearsEntity2
  .filter((i) => parseInt(i) > 2004)
  .filter(onlyUnique)
  .sort();

let overlaysEntity2 = {};

let layerControlEntity2 = L.control
  .layers({}, overlaysEntity2, {
    collapsed: false,
  })
  .addTo(map);

// generate a new map layer for each unique year
listUniqueYearsEntity2.forEach((year) => {
  newLayer = L.geoJson(geojsonPointsProperties2, {
    filter: function (feature, layer) {
      if (
        feature.properties["Unnamed: 0"] === "Current" &&
        feature.properties["Deed Date"].includes(year)
      )
        return true;
    },
    pointToLayer: function (feature, latlng) {
      return L.circleMarker(
        latlng,
        customCircleMarkerEntity2(parseInt(year) % 4)
      );
    },
    onEachFeature: onEachFeature,
  }).addTo(map);
  layerControlEntity2.addOverlay(newLayer, `High Point University - ${year}`);
});

let baseLayers1 = {
  "Open Street Map": tiles_OSM,
  "ESRI Satellite": tiles_Esri_WorldImagery,
};

let overlays1 = {};

let baseLayers2 = {};

let layerControlTiles = L.control
  .layers(baseLayers1, overlays1, {
    collapsed: false,
  })
  .addTo(map);

// move the layer controls to a custom position
let layerControlHtmlObject1 = layerControlEntity1.getContainer();
newContainerLayerControl1.appendChild(layerControlHtmlObject1);

let layerControlHtmlObject2 = layerControlEntity2.getContainer();
newContainerLayerControl2.appendChild(layerControlHtmlObject2);

let layerControlHtmlObjectDE = layerControlDirectExchange.getContainer();
newContainerLayerControlDirectExchange.appendChild(layerControlHtmlObjectDE);

let layerControlTilesHtmlObject = layerControlTiles.getContainer();
newContainerTilesControl.appendChild(layerControlTilesHtmlObject);

// print property details after clicking on circle
function printPropertyHistory(e) {
  containerFilteredResults.innerHTML = "";

  let selectedREID = e.target.feature.properties["REID"];
  let entity = e.target.feature.properties["entity"];

  let allFeatures;

  if (entity === "1") {
    allFeatures = geojsonPointsProperties1.features;
  } else {
    allFeatures = geojsonPointsProperties2.features;
  }

  let filteredFeaturesByREID = allFeatures.filter(
    (feature) => feature["properties"]["REID"] === selectedREID
  );

  // write address
  let newAddress = document.createElement("p");
  newAddress.className = "sidebar-text-name";
  newAddress.innerHTML =
    filteredFeaturesByREID[0].properties["Location Address"];
  containerFilteredResults.appendChild(newAddress);

  // write REID
  let newREID = document.createElement("p");
  newREID.className = "sidebar-text-type";
  newREID.innerHTML = "REID: " + filteredFeaturesByREID[0].properties["REID"];
  containerFilteredResults.appendChild(newREID);

  // write PIN
  let newPIN = document.createElement("p");
  newPIN.className = "sidebar-text-type";
  newPIN.innerHTML = "PIN: " + filteredFeaturesByREID[0].properties["PIN"];
  containerFilteredResults.appendChild(newPIN);

  // create separation line at bottom
  let separationLineTop = document.createElement("p");
  separationLineTop.className = "separation-centered";
  separationLineTop.innerHTML = "----------------------------------------";
  containerFilteredResults.appendChild(separationLineTop);

  filteredFeaturesByREID.forEach((feature) => {
    // write owner name
    let newOwnerName = document.createElement("p");
    newOwnerName.className = "sidebar-text-other";
    newOwnerName.innerHTML = "Owner: " + feature.properties["Owner Name"];
    containerFilteredResults.appendChild(newOwnerName);

    // write deed date
    let newDeed = document.createElement("p");
    newDeed.className = "sidebar-text-other";
    newDeed.innerHTML = "Deed Date: " + feature.properties["Deed Date"];
    containerFilteredResults.appendChild(newDeed);

    // write deed type
    let newDeedType = document.createElement("p");
    newDeedType.className = "sidebar-text-other";
    newDeedType.innerHTML = "Deed Type: " + feature.properties["Deed Type"];
    containerFilteredResults.appendChild(newDeedType);

    // write percent ownership
    let newPercentOwnership = document.createElement("p");
    newPercentOwnership.className = "sidebar-text-other";
    newPercentOwnership.innerHTML =
      "Ownership: " + feature.properties["% Ownership"] + "%";
    containerFilteredResults.appendChild(newPercentOwnership);

    // write sale price
    let newSalePrice = document.createElement("p");
    newSalePrice.className = "sidebar-text-other";
    newSalePrice.innerHTML = "Sale Price: " + feature.properties["Sale Price"];
    containerFilteredResults.appendChild(newSalePrice);

    // create separation line at bottom
    let separationLine = document.createElement("p");
    separationLine.className = "separation-centered";
    separationLine.innerHTML = "----------------------------------------";
    containerFilteredResults.appendChild(separationLine);
  });
}

