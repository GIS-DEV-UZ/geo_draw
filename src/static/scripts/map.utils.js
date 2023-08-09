let crop_list = [{
    val: 1,
    code: '101010000',
    name: 'Paxta'
  },
  {
    val: 2,
    code: '102010000',
    name: 'Bug`doy'
  },
  {
    val: 3,
    code: '106010000',
    name: 'No`xat'
  },
  {
    val: 4,
    code: '104040000',
    name: 'Piyoz'
  }
]

var popup = L.popup()

// Polygon maydonini gektarlarda hisoblovchi funksiya
function areaInHectares(coordinates) {
  var polygon = turf.polygon(coordinates);
  var area = turf.area(polygon);
  var inHectares = turf.convertArea(area, "meters", "hectares").toFixed(2);
  return inHectares;
}

// get polygon crop name
function getCropName(crop_id) {
  return crop_list.filter(crop => crop.code == crop_id)[0]['name']
}

// Bound to Polygon when clicked
function boundToPolygon(poly_id) {
  map.eachLayer(function (layer) {
    if (layer.options.type == 'Feature') {
      if (layer.options.properties.id == poly_id) {
        map.fitBounds(layer.getBounds());
        makePolygonPopup(layer, layer.options.properties)
      }
    }
  });
}

// Make Polygon Popup when clicked
function makePolygonPopup(layer, properties) {
  var table = document.createElement("table");
  var thead = document.createElement("thead")
  table.appendChild(thead)
  table.className = "table table-hover popup__table"
  thead.innerHTML = `
        <tr>
          <th>place_name</th>
          <td>${properties.place_name}</td>
        </tr>
        <tr>
          <th>crop_name</th>
          <td>${getCropName(properties.crop_code)}</td>
        </tr>
        <tr>
          <th>place_area</th>
          <td>${properties.place_area} ga</td>
        </tr>
        <tr>
          <th> <button class="btn btn-danger" onClick="deletePolygon(${properties.id})">Delete</button> </th>
          <td> <button class="btn btn-secondary" onClick="editPolygon(${properties.id})">Edit</button> </td>
        </tr>
    `;
  popup.setContent(table);
  layer.bindPopup(popup).openPopup();
  if (popup.isOpen()) {
    layer.closeTooltip()
  } else {
    layer.openTooltip()
  }
}




// =================== MAKE FIELDS LIST ================== //
let fields__list = document.querySelector('.fields__panel-list')

function make_fields_list(props) {
  fields__list.innerHTML = ''
  props.forEach(prop => {
    fields__list.innerHTML += `
            <li class="fields__panel-item" onclick="getBoundsField(${prop.id})">
                <div class="fields__panel-item__left">
                    <img src="../static/images/azure-satellite.png" alt="field 1" width="50" height="50">
                    <div class="fields__panel-item__info">
                        <h5 class="fields__panel-field__name">${prop.place_name}</h5>
                        <div class="d-flex">
                            <h4 class="fields__panel-crop__name">${getCropName(prop.crop_code)}</h4>
                            <h4 class="fields__panel-field__area">${prop.place_area} ga</h4>
                        </div>
                    </div>
                </div>
                <div class="fields__panel-item__right">
                    <button class="fields__panel-menu__btn">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                            xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M12 14C13.1046 14 14 13.1046 14 12C14 10.8954 13.1046 10 12 10C10.8954 10 10 10.8954 10 12C10 13.1046 10.8954 14 12 14Z"
                                fill="black" />
                            <path
                                d="M5 14C6.10457 14 7 13.1046 7 12C7 10.8954 6.10457 10 5 10C3.89543 10 3 10.8954 3 12C3 13.1046 3.89543 14 5 14Z"
                                fill="black" />
                            <path
                                d="M19 14C20.1046 14 21 13.1046 21 12C21 10.8954 20.1046 10 19 10C17.8954 10 17 10.8954 17 12C17 13.1046 17.8954 14 19 14Z"
                                fill="black" />
                        </svg>
                    </button>

                </div>
            </li>
        `
  })
}


// =============== MAKE AREA TOOLTIP FOR FIELD ================ //
function area_tool_tip(layer, area) {
  layer.bindTooltip("<div><b>" + area + " ga</b></div>", {
    direction: 'center',
    permanent: true,
    sticky: false,
    offset: [10, 0],
    opacity: 0.75,
    interactive: true,
    className: 'leaflet-customTooltip'
  });
  // layer.bindTooltip('TEST',{permanent: true}).openTooltip();
}


// =============== HIDE AREA TOOLTIP WHEN MAP SCROOLED ================ //
function hide_area_tooltip(zoom) {
  polygons_layer.eachLayer(function (layer) {
    if (zoom <= 15) {
      layer.closeTooltip()
    } else {
      layer.openTooltip()
    }
  })
}



// =============== MAKE FEATURELAYER ================ //
function createFeatureLayer(layer) {
  let coordinates = [];
  let field_area = null
  let finalPoint = null;
  let latlngs = layer._latlngs[0]

  finalPoint = [latlngs[0]["lng"], latlngs[0]["lat"]];
  latlngs.forEach((latlng) => {
    coordinates.push([latlng.lng, latlng.lat]);
  });
  coordinates.push(finalPoint);
  featureLayer["features"][0]["geometry"]["coordinates"][0] = [
    ...coordinates,
  ];
}


function FeatureLayer(layer) {
  this.field_coords = [];
  this.finalPoint = null;
  this.latlngs = null
  this.len = layer._latlngs[0].length
  this.featureLayer = {
    type: "FeatureCollection",
    features: [{
      type: "Feature",
      properties: {},
      geometry: {
        coordinates: [],
        type: "Polygon",
      },
    }, ],
  };

  this.polygon = null

  if (this.len == 1) {
    this.latlngs = layer._latlngs[0][0]
  } else {
    this.latlngs = layer._latlngs[0]
  }

  this.finalPoint = [this.latlngs[0]["lng"], this.latlngs[0]["lat"]];
  this.latlngs.forEach((latlng) => {
    this.field_coords.push([latlng.lng, latlng.lat]);
  });
  this.field_coords.push(this.finalPoint)

  this.featureLayer["features"][0]["geometry"]["coordinates"][0] = [
    ...this.field_coords,
  ];

  return this.featureLayer

}



// =============== MAKE POLYGON ================ //
function Polygon(layer, options) {
  this.field_coords = [];
  this.finalPoint = null;
  this.latlngs = null
  this.len = layer._latlngs[0].length
  this.polygon = null
  // Options
  this.title = options.title
  this.fillColor = options.fillColor
  this.fillOpacity = options.fillOpacity
  this.weight = options.weight
  this.color = options.color
  this.opacity = options.opacity
  this.fill = options.fill
  this.dashArray = options.dashArray
  this.polygon = options.polygon
  this.polygon_geojson = null

  if (this.len == 1) {
    this.latlngs = layer._latlngs[0][0]
  } else {
    this.latlngs = layer._latlngs[0]
  }

  this.finalPoint = [this.latlngs[0]["lat"], this.latlngs[0]["lng"]];
  this.latlngs.forEach((latlng) => {
    this.field_coords.push([latlng.lat, latlng.lng]);
  });
  this.field_coords.push(this.finalPoint)

  this.polygon = L.polygon(this.field_coords, {
    title: this.title,
    fillColor: this.fillColor,
    fillOpacity: this.fillOpacity,
    weight: this.weight,
    color: this.color,
    opacity: this.opacity,
    dashArray: this.dashArray,
    polygon: this.polygon,
    fill: this.fill
  })

  this.polygon_geojson = this.polygon.toGeoJSON()

  return this.polygon
}



// =================== CALCULATE POLYGON AREA ================== //
function polygon_area_calculator(e, edit_type) {
  var field_area = null
  var type = e.shape,
  layer = e.layer;
  if (edit_type == 'cut') {
      field_area = L.GeometryUtil.geodesicArea(layer.getLatLngs()[0]) / 10000;
  }
  if(layer){
    if (type === 'Polygon') {
      // drawn_layer.addLayer(layer);
      field_area = L.GeometryUtil.geodesicArea(layer.getLatLngs()[0]) / 10000;
    }
  } else {
    field_area = L.GeometryUtil.geodesicArea(e.getLatLngs()[0]) / 10000;
  }
  // console.log('leaflet : ', field_area);
  return field_area.toFixed(2)
}