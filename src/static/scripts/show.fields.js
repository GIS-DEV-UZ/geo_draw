// =================== VARIABLES ================== //

let fields_feature = []
let checked__field__feature = []
let polygons_layer = null

// =================== GET HTML ELEMENTS ================== //
let crop_checkBox = document.querySelectorAll('.field__crop-checkbox');

// =================== GET USER FIELDS ================== //
function get_user_fields() {
    fetch("/get/geometries")
        .then(res => res.json())
        .then(res => {

            let polygons_layer = L.geoJSON(res, {
                style: style,
                onEachFeature: onEachFeature,
                snapIgnore: false,
            }).addTo(map)
            map.fitBounds(polygons_layer.getBounds())

            make_fields_list()
        })
}
get_user_fields()



// =================== GET FIELD BOUNDS AND SHOW POPUP IN MAP  ================== //
function clickEachFeature(e) {
    let field_id = e.target.options.properties.id
    boundToPolygon(field_id)
}

// ///////////////////////////////////////////////////////////////////////

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
    makePolygonPopup(layer, feature.properties)
    fields_feature.push(feature)
}

function zoomToFeature(e) {
    map.fitBounds(e.target.getBounds());
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