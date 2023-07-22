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
    if (layer.feature) {
      if (layer.feature.properties.id == poly_id) {
        map.fitBounds(layer.getBounds());
        makePolygonPopup(layer, layer.feature.properties)
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
          <td>${getCropName(properties.crop_name)}</td>
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
  var popup = L.popup().setContent(table);
  layer.bindPopup(popup).openPopup();
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
