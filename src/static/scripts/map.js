var osmUrl = "http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    osmAttrib =
    '&copy; <a href="http://openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    osm = L.tileLayer(osmUrl, {
        maxZoom: 18,
        attribution: osmAttrib
    }),
    google = L.tileLayer("http://www.google.cn/maps/vt?lyrs=s@189&gl=cn&x={x}&y={y}&z={z}", {
        attribution: "google"
    }),
    mapbox = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v11/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoiZWxndW5uZXIiLCJhIjoiY2xhbTJvNnBjMGJ2dTNyb2J2aGc1b2NxOSJ9.hDeNCNqIfplhruYD3miwOQ")


let map = new L.Map("map", {
        center: new L.LatLng(41.311081, 69.240562),
        zoom: 13
    }),

drawnItems = new L.FeatureGroup().addTo(map);
let drawn_layers = L.layerGroup(null).addTo(map);
let drawn_polygons_layer = null
var featureGroup = L.featureGroup().addTo(map);

let tileLayers = {
    'mapbox': mapbox,
    'osm': osm,
    'google': google,
}


let layerControl = L.control.layers({}, {
    mapbox:mapbox.addTo(map),
    // google: google.addTo(map)
}, {
    collapsed: false
})

// CHANGE LAYER
var radio_layers = document.getElementsByName('layers');

radio_layers.forEach(radio_layer => {
    radio_layer.addEventListener('click', () => {
        for (var i = 0, length = radio_layers.length; i < length; i++) {
            if (radio_layers[i].checked) {
                let layer_name = radio_layers[i].value
                if(layer_name in tileLayers){
                    for(let layerName in tileLayers){
                        if(map.hasLayer(tileLayers[layerName])){
                            map.removeLayer(tileLayers[layerName])
                        }
                    }
                    L.control.layers({}, {
                        // mapbox:mapbox.addTo(map),
                        [tileLayers[layer_name]]: tileLayers[layer_name].addTo(map)
                    }, {
                        collapsed: false
                    })
                }
                break;
            }
        }
    })
})




// Create additional Control placeholders
function addControlPlaceholders(map) {
    var corners = map._controlCorners,
        l = 'leaflet-',
        container = map._controlContainer;

    function createCorner(vSide, hSide) {
        var className = l + vSide + ' ' + l + hSide;

        corners[vSide + hSide] = L.DomUtil.create('div', className, container);
    }

    createCorner('verticalcenter', 'left');
    createCorner('verticalcenter', 'right');
}
addControlPlaceholders(map);

// Change the position of the Zoom Control to a newly created placeholder.
map.zoomControl.setPosition('verticalcenterright');

// You can also put other controls in the same placeholder.
L.control.scale({
    position: 'verticalcenterright'
}).addTo(map);


