var osmUrl = "http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    osmAttrib =
    '&copy; <a href="http://openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    osm = L.tileLayer(osmUrl, {
        maxZoom: 20,
        attribution: osmAttrib
    }),
    google = L.tileLayer("http://www.google.cn/maps/vt?lyrs=s@189&gl=cn&x={x}&y={y}&z={z}", {
        maxZoom: 20,
        attribution: "Google"
    }),
    mapbox = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v11/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoiZWxndW5uZXIiLCJhIjoiY2xhbTJvNnBjMGJ2dTNyb2J2aGc1b2NxOSJ9.hDeNCNqIfplhruYD3miwOQ", {
        maxZoom: 20,
        attribution: "Mapbox"
    })


let map = new L.Map("map", {
        center: new L.LatLng(41.311081, 69.240562),
        zoom: 13
    }),
    drawnItems = new L.FeatureGroup().addTo(map);

var featureGroup = L.featureGroup().addTo(map);

let tileLayers = {
    'mapbox': mapbox.addTo(map),
    'osm': osm,
    'google': google,
}


let layerControl = L.control.layers(tileLayers).addTo(map)

// CHANGE LAYER
var radio_layers = document.getElementsByName('layers');

radio_layers.forEach(radio_layer => {
    radio_layer.addEventListener('click', () => {
        for (var i = 0, length = radio_layers.length; i < length; i++) {
            if (radio_layers[i].checked) {
                let layer_name = radio_layers[i].value
                if (layer_name in tileLayers) {
                    for (let layerName in tileLayers) {
                        if (map.hasLayer(tileLayers[layerName])) {
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


// =============== HIDE CONTROL LAYERS ================ //
const elControlLayerToggle = document.querySelector('.leaflet-control-layers-toggle')


// elControlLayers.style.display = 'none'
elControlLayerToggle.addEventListener('mouseover', ()=>{
    console.log(elControlLayerToggle.parentElement);
    elControlLayerToggle.parentElement.classList.remove('leaflet-control-layers-expanded')
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


// =============== GET ZOOM WHEN MAP SCROLLED ================ //
L.DomEvent.on(map.getContainer(), 'wheel', function () {
    hide_area_tooltip(map.getZoom())
});
