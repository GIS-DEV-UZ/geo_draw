// =================== VARIABLES ================== //

let fields__properties = []
let checked__field__props = []


// =================== GET HTML ELEMENTS ================== //
let crop_checkBox = document.querySelectorAll('.field__crop-checkbox');

// =================== GET USER FIELDS ================== //
function get_user_fields() {
    fetch("/api/polygon/get")
        .then(res => res.json())
        .then(res => {
            if (res) {
                addToMapDrawnLayers(res)
                res.features.forEach(feature => {
                    fields__properties.push(feature.properties)
                })
                make_fields_list(fields__properties)
            } else {
                console.log('Polygonlar yo`q');
            }
        })
}
get_user_fields()



var polygons_layer = new L.FeatureGroup();

function addToMapDrawnLayers(featureGroup) {
    featureGroup.features.forEach(feature => {
        let coordinates = feature.geometry.coordinates
        coordinates[0][0].forEach(coor => {
            coor.reverse()
        })
        var polygon = L.polygon(coordinates, {
            properties: feature.properties,
            color: 'red',
            type: 'Feature'
        }).addTo(map);
        polygon.on({
            // mouseover: highlightFeature,
            // mouseout: resetHighlight,
            click: clickEachFeature
        });
        polygons_layer.addLayer(polygon)
    })
    map.fitBounds(polygons_layer.getBounds())
}


// =================== SEARCH BY FIELD NAME ================== //
function searchFieldName(e) {
    if (checked__field__props.length != 0) {
        let one_field_prop = checked__field__props.filter(prop => prop.place_name.toLowerCase().includes(e))
        make_fields_list(one_field_prop)
    } else if (e.length > 0) {
        let one_field_prop = fields__properties.filter(prop => prop.place_name.toLowerCase().includes(e))
        make_fields_list(one_field_prop)
    } else if (e.length == 0) {
        searchByCropName()
    }

}


// =================== SEARCH BY CROP NAME ================== //
function searchByCropName() {
    let checked__field__props = []
    crop_checkBox.forEach((checkbox) => {
        if (checkbox.checked) {
            checked__field__props.push(...(fields__properties.filter(prop => prop.crop_code == checkbox.value)))
        }

    });
    make_fields_list(checked__field__props)
}



// =================== GET BOUNDS FIELD ================== //
function getBoundsField(field_id) {
    polygons_layer.eachLayer(function (layer) {
        if (layer.options.type == 'Feature') {
            if (layer.options.properties.id == field_id) {
                map.fitBounds(layer.getBounds())
            }
        }
    })
}


// =================== BOUND TO FIELD ================== //
function clickEachFeature(e){
    let field_id = e.target.options.properties.id
    boundToPolygon(field_id)
}