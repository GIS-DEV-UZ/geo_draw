// Leaflet-Geoman Toolbar

// Toolbar controls

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

// Toolbar visiblity

const addFieldBtn = document.querySelector('.map__add-btn')
const cropDashboardNav = document.querySelector('.crop__dashboard-nav')
const cropDashboardMain = document.querySelector('.crop__dashboard-main')
const elMapActions = document.querySelector('.map__actions')
const elMapCloseBtn = document.querySelector('.map__close-btn')

const elFieldCancelBtn = document.querySelector('.field__form-cancel')
const elFieldAddBtn = document.querySelector('.field__form-add')
const elFieldDrawBtn = document.querySelector('.map__draw-btn')
const elFieldDeleteBtn = document.querySelector('.map__delete-btn')
const elFieldAddPermBtn = document.querySelector('.map__addPerm-btn')
const elFieldFormBox = document.querySelector('.field__add-leftSide')
const elFieldForm = document.getElementById("field__form");
const elFieldFormImageWrapper = document.querySelector(".field__image-wrapper");



// Field actions 
elMapCloseBtn.addEventListener('click', () => {
    map.pm.removeControls(controls);
    map.pm.disableDraw();
})

elFieldDeleteBtn.addEventListener('click', () => {
    map.pm.enableGlobalRemovalMode();
})

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

let target_layer = null

map.on("pm:create", (e) => {
    elFieldAddPermBtn.style.display = 'block'
    target_layer = e.layer
    let coordinates = [];
    let field_area = null
    let finalPoint = null;
    let latlngs = target_layer._latlngs[0]

    finalPoint = [latlngs[0]["lng"], latlngs[0]["lat"]];
    latlngs.forEach((latlng) => {
        coordinates.push([latlng.lng, latlng.lat]);
    });
    coordinates.push(finalPoint);
    featureLayer["features"][0]["geometry"]["coordinates"][0] = [
        ...coordinates,
    ];
    field_area = `${areaInHectares(featureLayer["features"][0]["geometry"]["coordinates"])} ga`

    // target_layer.pm.enable()
    // target_layer.pm.enableDraw("Text", { textOptions: { text: "Geoman is fantastic! 🚀" } });
    // target_layer.pm.setText(field_area)
    // console.log(field_area);

    // target_layer.setText(field_area, {repeat: false,offset:5,center: [100,100],attributes: {'font-weight': 'bold','font-size': '24'}})
});

map.on("pm:remove", (e) => {
    elFieldDrawBtn.style.display = 'block'
    console.log('dsdsa');
})

elFieldDrawBtn.addEventListener('click', ()=>{
    elFieldDrawBtn.style.display = 'none'
    map.pm.enableDraw("Polygon")
})


if (elFieldAddPermBtn) {
    elFieldAddPermBtn.addEventListener('click', () => {
        elFieldAddPermBtn.style.display = 'none'
        elFieldFormBox.classList.add('field__add-leftSide-show')
        let elFieldFormBox_width = 450
        setTimeout(function () {
            map.fitBounds(target_layer.getBounds(), {'paddingTopLeft': [elFieldFormBox_width + 10, 10]});
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

        imageFetcher()
    })
}

if (elFieldCancelBtn) {
    elFieldCancelBtn.addEventListener('click', () => {
        elFieldFormBox.classList.remove('field__add-leftSide-show')
        elFieldAddPermBtn.style.display = 'none'
        elFieldForm.reset()
    })
}

map.on("pm:remove", (e) => {
    elFieldAddPermBtn.style.display = 'none'
    elFieldFormBox.classList.remove('field__add-leftSide-show')
    map.pm.toggleGlobalRemovalMode();
});


elFieldForm.addEventListener("submit", async (e) => {
    e.preventDefault();
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


