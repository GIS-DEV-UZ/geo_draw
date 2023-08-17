const elFieldCancel = document.querySelector('.map__cancel-btn.edit')
const elFieldEditFormCloseBtn = document.querySelector('.field__form-edit-cancel')
const elFieldEditFormSaveBtn = document.querySelector('.field__form-edit-save')
const elFieldEditPermBtn = document.querySelector('.map__editPerm-btn')
const elFieldEditFormBox = document.querySelector('.field__edit-leftSide')
const fieldEditForm = document.querySelector('.field__edit-form')
const elFieldEditBtn = document.querySelector('.map__edit-btn')
const elFieldEditFormImageWrapper = document.querySelector(".field__image-wrapper.edit");
let editable_layer = new L.FeatureGroup().addTo(map);
let editable_feature_group = new L.FeatureGroup().addTo(map);
let original_field_border = null
let original_field = null
let last_edited_layer = null
let cutted_layer = null
let editable_polygon = null
let polygon_border = null
let polygon_feature_for_save = null
let polygon_layer_for_save = null
let editable_field_id = null

function editPolygon(field_id) {
    editable_field_id = field_id
    elDashboardNav.style.display = 'none'
    elDashboardMain.style.width = '100vw'
    elMapActions.style.display = 'flex'
    document.querySelector('.crop__dashboard-header__text').textContent = 'Edit Field Page'

    get_user_fields(field_id)

    map.eachLayer(function (layer) {        
        let field_props = layer?.options?.properties
        let field_props_len = null
        if (field_props) {
            field_props_len = Object.keys(layer?.options?.properties).length
        }
        if (field_props_len) {
            if (layer.options.properties.id == field_id) {
                original_field = layer
                area_tool_tip(layer, polygon_area_calculator(layer, ''))
                map.pm.addControls({
                    position : 'topright',
                    drawMarker : false,
                    drawCircleMarker : false,
                    drawPolyline : false,
                    drawRectangle : false,
                    drawPolygon : false,
                    drawCircle : false,
                    drawText : false,
                    removalMode : false,
                    rotateMode : false,
                })

                
                editable_polygon = new Polygon(layer,{
                    title: "test",
                    fillColor: "#F16E60",
                    fillOpacity: 0.5,
                    weight: 5,
                    color: "#F16E60",
                    opacity: 0.7,
                    fill: false,
                })
                editable_feature_group.addLayer(editable_polygon)
                

                polygon_border = new Polygon(layer,{
                    color: "black",
                    weight: "3",
                    opacity: 0.7,
                    fill: true,
                    fillColor: '#ced4da',
                    fillOpacity : 0.5,
                    dashArray: "10 10",
                    polygon: editable_polygon,
                }) 
                editable_layer.addLayer(polygon_border)
                  
                editable_feature_group.pm.enable({
                    allowEditing : false,
                    draggable : false,
                    allowCutting : false,
                });
                editable_layer.pm.enable({
                    allowSelfIntersection: false,
                    draggable : true,
                });
                map.removeLayer(layer);

                  
            } else {
                layer._pmTempLayer = {};
                // Disable clicking to layer
                L.DomUtil.removeClass(layer._path, 'leaflet-interactive');
            }
        }
    })
}

editable_layer.on("pm:edit", (e) => {
    elFieldEditPermBtn.style.display = 'block'
    elFieldCancel.style.display = 'block'
    elFieldEditBtn.style.display = 'none'
    last_edited_layer = e.layer
    editable_layer.addLayer(last_edited_layer)
    polygon_feature_for_save = new FeatureLayer(last_edited_layer)
    polygon_layer_for_save = last_edited_layer
    area_tool_tip(last_edited_layer, polygon_area_calculator(e, ''))
});


elFieldEditPermBtn.addEventListener('click', ()=>{
    elFieldEditFormBox.classList.add('field__edit-leftSide-show')
    elFieldEditPermBtn.style.display = 'none'
    elFieldCancel.style.display = 'none'
    elFieldEditBtn.style.display = 'none'

    let elFieldAddFormBox_width = 450
        setTimeout(function () {
            map.fitBounds(polygon_layer_for_save.getBounds(), {
                'paddingTopLeft': [elFieldAddFormBox_width + 10, 10]
            });
        }, 100);

        let img_data = {
            geometry: polygon_feature_for_save["features"][0]["geometry"]
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
            elFieldEditFormImageWrapper.innerHTML = `
                <img class="field__image" src="${polyImageUrl.replace('-1', image_id.toString())}" alt="field image" width="350px" height="150px">
                <span class="mt-2">${polygon_area_calculator(polygon_layer_for_save, '')} ga</span>
            `
        }

        setTimeout(function () {
            window.dispatchEvent(new Event("resize"));
        }, 200);

        imageFetcher()


})


elFieldEditFormCloseBtn.addEventListener('click', ()=>{
    elFieldEditFormBox.classList.remove('field__edit-leftSide-show')
    elFieldEditBtn.style.display = 'block'
    elFieldEditPermBtn.style.display = 'block'
    map.pm.disableGlobalEditMode();
})

map.on("pm:cut", (e) => {
    cutted_layer = e.layer
    editable_layer.addLayer(cutted_layer)
    polygon_feature_for_save = new FeatureLayer(cutted_layer)
    polygon_layer_for_save = cutted_layer
    area_tool_tip(cutted_layer, polygon_area_calculator(e, 'cut'))
});

elFieldCancel.addEventListener('click', ()=>{
    elFieldCancel.style.display = 'none'
    elFieldEditPermBtn.style.display = 'none'
    elFieldEditBtn.style.display = 'block'
    
    if(editable_layer.hasLayer(last_edited_layer)){
        editable_layer.removeLayer(last_edited_layer)
    } if(cutted_layer){
        if(editable_layer.hasLayer(cutted_layer)){
            editable_layer.removeLayer(cutted_layer)
        }
    }

    original_field_border = new Polygon(original_field,{
        color: "black",
        weight: "3",
        opacity: 0.7,
        fill: true,
        fillColor: '#ced4da',
        fillOpacity : 0.4,
        dashArray: "10 10",
        polygon: editable_polygon,
    }) 

    editable_layer.addLayer(original_field_border)
    let e = null
    for(let [key, val] of Object.entries(original_field_border._eventParents)){
        e = original_field_border._eventParents[key].pm._layers[0]
    }
    area_tool_tip(original_field_border, polygon_area_calculator(e, ''))
    
    map.pm.disableGlobalEditMode();
})


elFieldEditBtn.addEventListener('click', ()=>{
    elFieldEditBtn.style.display = 'none'
    map.pm.enableGlobalEditMode();
})


// =================== SAVE EDITED FIELDS ================== //
elFieldEditFormSaveBtn.addEventListener('click', ()=>{

})

// =============== SAVE FIELD ================ //
fieldEditForm.addEventListener("submit", async (e) => {
    // e.preventDefault();
    let formData = new FormData(fieldEditForm);
    let data = {
        field_name: formData.get("field_name"),
        crop_code: crop_list.filter(crop => crop.val.toString() == formData.get("crop_name"))[0]['code'],
        field_area: polygon_area_calculator(polygon_layer_for_save, ''),
        geometry: polygon_feature_for_save["features"][0]["geometry"]
    }

    let response = await fetch(`/api/polygon/update/${editable_field_id}`, {
        method: "PUT",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });

    let result = await response.json();

    fieldEditForm.reset()
    // elFieldAddFormBox.classList.remove('field__add-leftSide-show')
})



// =================== GET USER FIELDS ================== //
function get_user_fields(field_id) {
    fetch(`/api/polygon/get/${field_id}`)
        .then(res => res.json())
        .then(res => {
            if (res) {
                document.querySelector('.fieldName.edit').value = res.place_name
                document.querySelector('.form-select.edit').value = crop_list.filter(crop => crop.code == res.crop_code)[0]['val']
            } else {
                console.log('Polygonlar yo`q');
            }
        })
}


function deletePolygon(field_id){
    if(confirm('Polygonni o`chirishni hohlayszmi?')){
        fetch(`/api/polygon/delete/${field_id}`)
        .then(res => res.json())
        .then(res => {
            console.log(res);
        })
    }
    window.location.reload();
}



















// function setClickable(target, value) {
//     console.log(value);
//     console.log(target.options.clickable);
//     if(value && !target.options.clickable) {
//         target.options.clickable = true;
//         L.Path.prototype._initEvents.call(target);
//         target._path.removeAttribute('pointer-events');
//     } else if(!value && target.options.clickable) {
//         target.options.clickable = false;

//         // undoing actions done in L.Path.prototype._initEvents
//         L.DomUtil.removeClass(target._path, 'leaflet-clickable');
//         L.DomEvent.off(target._container, 'click', target._onMouseClick);
//         ['dblclick', 'mousedown', 'mouseover', 'mouseout', 'mousemove', 'contextmenu'].forEach(function(evt) {
//             L.DomEvent.off(target._container, evt, target._fireMouseEvent);
//         });

//         target._path.setAttribute('pointer-events', target.options.pointerEvents || 'none');
//     }
// }
