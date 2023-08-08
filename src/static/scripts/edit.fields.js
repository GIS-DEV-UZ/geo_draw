const elFieldCancel = document.querySelector('.map__cancel-btn.edit')
const elFieldEditFormCloseBtn = document.querySelector('.field__form-edit-cancel')
const elFieldEditPermBtn = document.querySelector('.map__editPerm-btn')
const elFieldEditFormBox = document.querySelector('.field__edit-leftSide')
const elFieldEditBtn = document.querySelector('.map__edit-btn')
let editable_layer = new L.FeatureGroup().addTo(map);
let editable_feature_group = new L.FeatureGroup().addTo(map);
let original_field_border = null
let original_field = null
let last_edited_layer = null
let cutted_layer = null
let editable_polygon = null
let polygon_border = null

function editPolygon(field_id) {
    elDashboardNav.style.display = 'none'
    elDashboardMain.style.width = '100vw'
    elMapActions.style.display = 'flex'
    document.querySelector('.crop__dashboard-header__text').textContent = 'Edit Field Page'

    map.eachLayer(function (layer) {        
        let field_props = layer?.options?.properties
        let field_props_len = null
        if (field_props) {
            field_props_len = Object.keys(layer?.options?.properties).length
        }
        if (field_props_len) {
            if (layer.options.properties.id == field_id) {
                original_field = layer
                console.log(layer);
                console.log(polygon_area_calculator(layer, ''));
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
                    fill: false,
                    fillColor: null,
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
    area_tool_tip(last_edited_layer, polygon_area_calculator(e, ''))
});


elFieldEditPermBtn.addEventListener('click', ()=>{
    elFieldEditFormBox.classList.add('field__edit-leftSide-show')
    elFieldEditPermBtn.style.display = 'none'
    elFieldCancel.style.display = 'none'
    elFieldEditBtn.style.display = 'none'
})


elFieldEditFormCloseBtn.addEventListener('click', ()=>{
    elFieldEditFormBox.classList.remove('field__edit-leftSide-show')
    elFieldEditBtn.style.display = 'block'
})

map.on("pm:cut", (e) => {
    cutted_layer = e.layer
    editable_layer.addLayer(cutted_layer)
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
        console.log(e);
    }
    area_tool_tip(original_field_border, polygon_area_calculator(e, ''))
    // console.log(original_field_border);
    map.pm.disableGlobalEditMode();
})


elFieldEditBtn.addEventListener('click', ()=>{
    elFieldEditBtn.style.display = 'none'
    map.pm.enableGlobalEditMode();
})























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
