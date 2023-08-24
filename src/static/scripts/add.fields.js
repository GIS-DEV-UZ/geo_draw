// =================== GET HTML ELEMENTS ================== //
const elAddFieldBtn = document.querySelector('.fields__panel-add__field')
const elAddForm = document.querySelector('.field__add-form')
const elMapActions = document.querySelector('.map__actions')
const elFieldAddPermBtn = document.querySelector('.map__addPerm-btn')
const elFieldDeleteBtn = document.querySelector('.map__delete-btn')
const elFieldDrawBtn = document.querySelector('.map__draw-btn')
const elFieldAddFormBox = document.querySelector('.field__add-leftSide')
const elFieldFormImageWrapper = document.querySelector(".field__image-wrapper");
const elFieldFormCancelBtn = document.querySelector('.field__form-cancel')
const elFieldForm = document.getElementById("field__form");
const elDashboardNav = document.querySelector('.crop__dashboard-nav')
const elDashboardMain = document.querySelector('.crop__dashboard-main')


// =================== CREATE FEATURE GROUP FOR LAST DRAWN LAYER ================== //
let last_drawn_layer = new L.FeatureGroup({
    pmIgnore: true,
    snapIgnore: false
});
let field_area = null
let line_length = null
let polygon_length = null


// =================== CONTROL OPTIONS ================== //
let controls = {
    position: 'topright',
    drawPolyline: true,
    drawCircleMarker: false,
    rotateMode: false,
    drawMarker: false,
    drawCircleMarker: false,
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
    document.querySelector('.crop__dashboard-header__text').textContent = 'Add Field Page'

    elPanelBox.classList.toggle('paneLeft-show')
    elPanelBtn.classList.toggle('paneLeft__bnt-show')

    setTimeout(function () {
        window.dispatchEvent(new Event("resize"));
    }, 200);
    
    map.pm.addControls(controls)
    map.eachLayer(layer => {
        // This has no effect
        // layer.pm.disable();

        // But these two work
        
        // layer._pmTempLayer = {}; This code is disabling snappable to polygon

        // USE THIS CODE 
        delete layer.pm
    })
})



// =============== GET FIELD GEOMETRIES ================ //
let target_layer = null
let shape_type = null
map.on("pm:create", (e) => {
    shape_type = e.shape
    elFieldAddPermBtn.style.display = 'block'
    elFieldDeleteBtn.style.display = 'block'

    target_layer = e.layer  
    map.pm.enableDraw("Polygon", {
        snappable: true,
        snapDistance: 20,
    })
    map.pm.disableDraw();
    
        

    if (shape_type == "Line") {
        line_length = polyline_length_calculator(target_layer)
        last_drawn_layer.addLayer(target_layer)
        featureLayer = new FeatureLayer(target_layer, shape_type)
        console.log('////////////////');
        console.log(featureLayer);
        console.log('line : ', line_length, 'km');
    } else if (shape_type == "Polygon") {
        polygon_area_calculator(e, 'create')
        field_area = areaInHectares(target_layer)
        area_tool_tip(target_layer, field_area, 'ga')
        createFeatureLayer(target_layer)

        polygon_length = polyline_length_calculator(target_layer)
        console.log('poly_line : ', polygon_length, 'km');

        last_drawn_layer.addLayer(target_layer)

        // async function areaFetcher() {
        //     const response = await fetch("/api/polygon/area", {
        //         method: "POST",
        //         credentials: "include",
        //         headers: {
        //             "Content-Type": "application/json",
        //         },
        //         body: JSON.stringify(featureLayer["features"][0]["geometry"]["coordinates"]),
        //     });
        //     field_area = await response.json();
        //     console.log('pgadmin : ', field_area, 'ga');
        //     field_area = field_area.toFixed(2)
        //     area_tool_tip(target_layer, field_area, 'ga')
        // }

        // areaFetcher()
    }



});


// =============== CUT FIELD ================ //
map.on("pm:cut", (e) => {
    target_layer = e.layer
    last_drawn_layer.addLayer(target_layer)
    polygon_length = polyline_length_calculator(target_layer)
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
    map.pm.enableDraw("Polygon", {
        snappable: true
    })
})


// =============== OPEN FORM FIELD ================ //
if (elFieldAddPermBtn) {
    elFieldAddPermBtn.addEventListener('click', () => {
        if (shape_type == "Line") {
            document.querySelector('.line-control').style.display = 'block'
            document.querySelector('.line-length').value = `${line_length} km`

        }else if (shape_type == "Polygon") {
            document.querySelector('.polygon-control').style.display = 'block'
        }
        elFieldAddPermBtn.style.display = 'none'
        elFieldDeleteBtn.style.display = 'none'
        elFieldAddFormBox.classList.add('field__add-leftSide-show')
        map.pm.removeControls(controls)

        let elFieldAddFormBox_width = 450
        setTimeout(function () {
            map.fitBounds(target_layer.getBounds(), {
                'paddingTopLeft': [elFieldAddFormBox_width + 10, 10]
            });
        }, 100);

        let img_data = null

        if (shape_type == 'Polygon') {
            img_data = {
                geometry: featureLayer["features"][0]["geometry"]
            }

            let image_id = null
            elFieldFormImageWrapper.innerHTML = ''
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
                <span class="mt-2">${field_area} ga</span>
            `
            }

            setTimeout(function () {
                window.dispatchEvent(new Event("resize"));
            }, 200);

            imageFetcher()
        } else if (shape_type == 'Line') {
            img_data = {
                geometry: featureLayer["geometry"]
            }
        }
        console.log(img_data);
    })
}


// =============== CANCEL FORM FIELD ================ //
elFieldFormCancelBtn.addEventListener('click', () => {
    elFieldAddFormBox.classList.remove('field__add-leftSide-show')
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
    e.preventDefault();
    let formData = new FormData(elFieldForm);

    elDashboardNav.style.display = 'block'
    elPanelBox.classList.toggle('paneLeft-show')
    elPanelBtn.classList.toggle('paneLeft__bnt-show')

    if (shape_type == "Line") {
        let data = {
            field_name: formData.get("field_name"),
            line_length : line_length,
            geometry: featureLayer["geometry"]
        }
        console.log(data);

        // let response = await fetch("/api/line/save", {
        //     method: "POST",
        //     credentials: "include",
        //     headers: {
        //         "Content-Type": "application/json",
        //     },
        //     body: JSON.stringify(data),
        // });
    
        // let result = await response.json();
    } else if (shape_type == "Polygon"){
        let data = {
            field_name: formData.get("field_name"),
            crop_code: crop_list.filter(crop => crop.val.toString() == formData.get("crop_name"))[0]['code'],
            field_area: field_area,
            field_length: polygon_length,
            geometry: featureLayer["features"][0]["geometry"]
        }

        make_fields_list([{
            properties : {
                crop_code : data["crop_code"], 
                place_area : data["field_area"], 
                place_length : data["field_length"], 
                place_name : data["field_name"] 
            },
            geometry : {
                coordinates : data['geometry']["coordinates"],
                type : 'MultiPolygon'
            }
        }])

        target_layer['feature'] = {
            geometry : {
                coordinates : make_polygon_full_coors(target_layer)
            }
        }

        if(!polygons_layer.hasLayer(target_layer)){
            let layer = new Polygon(target_layer, {
                fillColor : '#20c997',
                weight : 2,
                opacity : 1,
                color : 'white',
                dashArray : 3,
                fillOpacity : 0.4,
                fill : true
            })
            
            if(last_drawn_layer.hasLayer(target_layer)){
                map.removeLayer(target_layer)
                last_drawn_layer.removeLayer(target_layer)
            }
            layer['feature'] = {
                properties : {
                    crop_code : data["crop_code"], 
                    place_area : data["field_area"], 
                    place_length : data["field_length"], 
                    place_name : data["field_name"] ,
                    id : (Math.random()*1000).toFixed(0)
                },
                geometry : {
                    coordinates : data['geometry']["coordinates"],
                    type : 'MultiPolygon'
                }
            }
            console.log(layer['feature']['properties']['id']);
            polygons_layer.addLayer(layer)
            
            // polygons_layer.eachLayer(function(layer) {
            //     onEachFeature(layer.feature, layer)
            // })
            map.eachLayer(function(layer) {
                if(layer.feature){
                    onEachFeature(layer.feature, layer)
                    // console.log(layer);
                }
            })
        }
    
        // let response = await fetch("/api/polygon/save", {
        //     method: "POST",
        //     credentials: "include",
        //     headers: {
        //         "Content-Type": "application/json",
        //     },
        //     body: JSON.stringify(data),
        // });
    
        // let result = await response.json();
    }
    
    elFieldForm.reset()
    elFieldAddFormBox.classList.remove('field__add-leftSide-show')
})


function areaInHectares(layer) {
    let coordinates = [];
    let field_area = null
    let finalPoint = null;
    let latlngs = layer._latlngs[0]

    finalPoint = [latlngs[0]["lng"], latlngs[0]["lat"]];
    latlngs.forEach((latlng) => {
        coordinates.push([latlng.lng, latlng.lat]);
    });
    coordinates.push(finalPoint)
    var polygon = turf.polygon([coordinates]);
    var area = turf.area(polygon);
    var inHectares = (turf.convertArea(area, "meters", "hectares")).toFixed(2);
    console.log('turf : ', inHectares, 'ga');
    return inHectares;
}