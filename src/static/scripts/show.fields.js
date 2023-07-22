// =================== VARIABLES ================== //
let polygonsLayer = null
let fields__properties = []


// =================== GET HTML ELEMENTS ================== //


// =================== GET USER FIELDS ================== //
function get_user_fields() {
    fetch("/api/polygon/get")
        .then(res => res.json())
        .then(res => {
            let featureCollection = res
            featureCollection.features.forEach(feature => {
                fields__properties.push(feature.properties)
            })
            polygonsLayer = L.geoJSON(featureCollection).addTo(map);
            map.fitBounds(polygonsLayer.getBounds())
            make_fields_list(fields__properties)
        })
}
get_user_fields()

// =================== SEARCH BY FIELD NAME ================== //
function searchFieldName(e) {
    let one_field_prop = fields__properties.filter(prop => prop.place_name.toLowerCase().includes(e))
    make_fields_list(one_field_prop)
}


// =================== SEARCH BY CROP NAME ================== //
let crop_checkBox = document.querySelectorAll('.field__crop-checkbox');

function searchByCropName(e) {
    console.log(fields__properties);
    let fields_props = []
    crop_checkBox.forEach((checkbox) => {
        if(checkbox.checked){
            console.log(checkbox.value);
            console.log(fields__properties.filter(prop => prop.crop_code == checkbox.value));
            fields_props.push(fields__properties.filter(prop => prop.crop_code == checkbox.value))
        }
        
    });
    // make_fields_list(fields_props[0])
    console.log(fields_props);
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