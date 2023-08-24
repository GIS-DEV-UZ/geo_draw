// =================== VARIABLES ================== //

let fields_feature = []
let checked__field__feature = []

// =================== GET HTML ELEMENTS ================== //
let crop_checkBox = document.querySelectorAll('.field__crop-checkbox');

// =================== GET USER FIELDS ================== //
let url = "/get/geometries"
let url1 = "https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_50m_geography_regions_polys.geojson"
map.spin(true, {
    lines: 13,
    length: 40
});


let polygons_layer = new L.GeoJSON.AJAX(url, {
    style: style,
    onEachFeature: onEachFeature,
    snapIgnore: false,
}).addTo(map)


polygons_layer.on('data:loaded', () => {
    map.fitBounds(polygons_layer.getBounds())
    make_fields_list()
    setTimeout(() => {
        map.spin(false);
    }, 1000);
});



// $.getJSON('https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_50m_geography_regions_polys.geojson', function(data) {
//     let polygons_layer = L.geoJson(data).addTo(map);
//     map.fitBounds(polygons_layer.getBounds())
//     map.spin(false);
// });


function style(feature) {
    return {
        fillColor: feature.geometry.type == "LineString" ? '#ffd43b' : '#20c997',
        weight: feature.geometry.type == "LineString" ? '4' : '2',
        opacity: 1,
        color: feature.geometry.type == "LineString" ? '#ffd43b' : 'white',
        dashArray: feature.geometry.type == "LineString" ? 'none' : '3',
        fillOpacity: feature.geometry.type == "LineString" ? '1' : '0.4'
    };
}


function onEachFeature(feature, layer) {
    layer.on({
        // mouseover: highlightFeature,
        // mouseout: resetHighlight,
        click: zoomToFeature
    });
    // console.log(layer);
    // console.log(feature);
    makePolygonPopup(layer, feature.properties)
    if (feature.properties.place_area) {
        area_tool_tip(layer, feature.properties.place_area, 'ga')
    } else {
        area_tool_tip(layer, feature.properties.place_length, 'km')
        polyline_length_calculator(layer)
    }

    fields_feature.push(feature)
}

function zoomToFeature(e) {
    let layer = e.target
    map.fitBounds(layer.getBounds());
}


// =================== GET FIELD BOUNDS IN FIELD LIST ================== //
function getBoundsField(field_id) {
    map.eachLayer(function (layer) {
        if (layer.feature) {
            if (layer.feature.properties.id == field_id) {
                map.fitBounds(layer.getBounds())
                makePolygonPopup(layer, layer.feature.properties)
            }
        }
    })
}

// =================== SEARCH BY FIELD NAME ================== //
function searchFieldName(e) {
    console.log(checked__field__feature);
    if (checked__field__feature.length != 0) {
        let one_field_feature = checked__field__feature.filter(feature => feature.properties.place_name.toLowerCase().includes(e))
        make_fields_list(one_field_feature)
    } else if (e.length > 0) {
        let one_field_feature = fields_feature.filter(feature => feature.properties.place_name.toLowerCase().includes(e))
        make_fields_list(one_field_feature)
    } else if (e.length == 0) {
        searchByCropName()
    }

}


// =================== SEARCH BY CROP NAME ================== //
function searchByCropName() {
    let checked__field__feature = []
    crop_checkBox.forEach((checkbox) => {
        if (checkbox.checked) {
            checked__field__feature.push(...(fields_feature.filter(feature => feature.properties.crop_code == checkbox.value)))
        }
    });
    make_fields_list(checked__field__feature)
}