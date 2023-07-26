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
                make_fields_list(fields__properties)
            } else {
                console.log('Polygonlar yo`q');
            }
        })
}
get_user_fields()



var polygons_layer = new L.FeatureGroup();
function addToMapDrawnLayers(featureGroup){
    featureGroup.features.forEach(feature => {
        let coordinates = feature.geometry.coordinates
        coordinates[0][0].forEach(coor=>{
            coor.reverse()
        })
        var polygon = L.polygon(coordinates, {color: 'red'}).addTo(map);
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
    map.eachLayer(function (layer) {
        if (layer.feature) {
            if (layer.feature.properties.id == field_id) {
                map.fitBounds(layer.getBounds())
            }
        }
    })
}