// =================== GET HTML ELEMENTS ================== //
const elAddFieldBtn = document.querySelector('.fields__panel-add__field')
const elMapActions = document.querySelector('.map__actions')
const elFieldAddPermBtn = document.querySelector('.map__addPerm-btn')
const elFieldDeleteBtn = document.querySelector('.map__delete-btn')
const elFieldDrawBtn = document.querySelector('.map__draw-btn')
const elFieldFormBox = document.querySelector('.field__add-leftSide')
const elFieldFormImageWrapper = document.querySelector(".field__image-wrapper");
const elFieldCancelBtn = document.querySelector('.field__form-cancel')
const elFieldForm = document.getElementById("field__form");
const elDashboardNav = document.querySelector('.crop__dashboard-nav')
const elDashboardMain = document.querySelector('.crop__dashboard-main')


// =================== CREATE FEATURE GROUP FOR LAST DRAWN LAYER ================== //
let last_drawn_layer = new L.FeatureGroup();


// =================== CONTROL OPTIONS ================== //
let controls = {
    position: 'topright',
    drawCircleMarker: false,
    rotateMode: false,
    drawMarker: false,
    drawCircleMarker: false,
    drawPolyline: false,
    drawRectangle: false,
    drawCircle: false,
    drawText: false,
}


// =================== MAKE FEATURELAYER VARIABLE ================== //
let featureLayer = {
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

// =============== SHOW FIELD ACTIONS ================ //
elAddFieldBtn.addEventListener('click', () => {
    elDashboardNav.style.display = 'none'
    elDashboardMain.style.width = '100vw'
    elMapActions.style.display = 'flex'

    setTimeout(function () {
        window.dispatchEvent(new Event("resize"));
    }, 200);
    map.pm.enableDraw("Polygon")
    map.pm.addControls(controls)
    polygons_layer.eachLayer(layer => {
        // This has no effect
        // layer.pm.disable();
        // But this has
        layer._pmTempLayer = {};
    })
})


// =============== GET FIELD GEOMETRIES ================ //
let target_layer = null
map.on("pm:create", (e) => {
    elFieldAddPermBtn.style.display = 'block'
    elFieldDeleteBtn.style.display = 'block'

    target_layer = e.layer

    createFeatureLayer(target_layer)

    last_drawn_layer.addLayer(target_layer)

    field_area = `${areaInHectares(featureLayer["features"][0]["geometry"]["coordinates"])} ga`

    toolTip(target_layer, field_area)

});


// =============== CUT FIELD ================ //
map.on("pm:cut", (e) => {
    target_layer = e.layer
    last_drawn_layer.addLayer(target_layer)
    createFeatureLayer(e.layer)
});



// =============== REMOVE FIELD ================ //
elFieldDeleteBtn.addEventListener('click', () => {
    if (last_drawn_layer.hasLayer(target_layer)) {
        map.removeLayer(target_layer);
    }
    elFieldDeleteBtn.style.display = 'none'
    elFieldAddPermBtn.style.display = 'none'
    elFieldDrawBtn.style.display = 'block'
})

map.on("pm:remove", (e) => {
    elFieldDeleteBtn.style.display = 'none'
    elFieldAddPermBtn.style.display = 'none'
    elFieldDrawBtn.style.display = 'block'
});




// =============== DRAG FIELD ================ //
// last_drawn_layer.on("pm:drag", (e) => {
//     createFeatureLayer(e.layer)
// });

// =============== DRAW FIELD ================ //
elFieldDrawBtn.addEventListener('click', () => {
    elFieldDrawBtn.style.display = 'none'
    map.pm.enableDraw("Polygon")
})


// =============== OPEN FORM FIELD ================ //
if (elFieldAddPermBtn) {
    elFieldAddPermBtn.addEventListener('click', () => {
        elFieldAddPermBtn.style.display = 'none'
        elFieldDeleteBtn.style.display = 'none'
        elFieldFormBox.classList.add('field__add-leftSide-show')
        map.pm.removeControls(controls)

        let elFieldFormBox_width = 450
        setTimeout(function () {
            map.fitBounds(target_layer.getBounds(), {
                'paddingTopLeft': [elFieldFormBox_width + 10, 10]
            });
        }, 100);

        let img_data = {
            geometry: featureLayer["features"][0]["geometry"]
        }
        let image_id = null
        async function imageFetcher() {
            const response = await fetch("/api/polygon/draw", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(img_data),
            });
            const image_id = await response.json();
            elFieldFormImageWrapper.innerHTML = `
                <img class="field__image" src="${polyImageUrl.replace('-1', image_id.toString())}" alt="field image" width="350px" height="150px">
                <span class="mt-2">${areaInHectares(featureLayer["features"][0]["geometry"]["coordinates"])} ga</span>
            `
        }

        setTimeout(function () {
            window.dispatchEvent(new Event("resize"));
        }, 200);

        imageFetcher()
    })
}


// =============== CANCEL FORM FIELD ================ //
elFieldCancelBtn.addEventListener('click', () => {
    elFieldFormBox.classList.remove('field__add-leftSide-show')
    elFieldAddPermBtn.style.display = 'block'
    elFieldDeleteBtn.style.display = 'block'
    setTimeout(function () {
        window.dispatchEvent(new Event("resize"));
    }, 200);
    map.fitBounds(polygons_layer.getBounds())
    map.pm.addControls(controls)
    elFieldForm.reset()
})


// =============== SAVE FIELD ================ //
elFieldForm.addEventListener("submit", async (e) => {
    // e.preventDefault();
    let formData = new FormData(elFieldForm);
    let data = {
        field_name: formData.get("field_name"),
        crop_code: crop_list.filter(crop => crop.val.toString() == formData.get("crop_name"))[0]['code'],
        field_area: areaInHectares(featureLayer["features"][0]["geometry"]["coordinates"]),
        geometry: featureLayer["features"][0]["geometry"]
    }

    let response = await fetch("/api/polygon/save", {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });

    let result = await response.json();

    elFieldForm.reset()
    elFieldFormBox.classList.remove('field__add-leftSide-show')
})


// function onEachFeature(feature, layer) {
//     layer.on({
//         // mouseover: highlightFeature,
//         // mouseout: resetHighlight,
//         click: clickEachFeature
//     });
// }

// function clickEachFeature(e){
//     console.log(e);
// }

function toolTip(layer, area) {
    layer.bindTooltip("<div><b>" + area + "</b></div>", {
        direction: 'center',
        permanent: true,
        sticky: false,
        offset: [10, 0],
        opacity: 0.75,
        className: 'leaflet-customTooltip'
    });
    // layer.bindTooltip('TEST',{permanent: true}).openTooltip();
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


// =============== COUNT FIELD AREA ================ //
function countFieldArea(){

}