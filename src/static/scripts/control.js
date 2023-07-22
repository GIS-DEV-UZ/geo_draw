const elPanelBtn = document.querySelector('.crop__dashboard-panel__btn')
const elPanelBox = document.querySelector('.crop__dashboard-panel__container')
const elArrowLeft = document.querySelector('.arrow-left')
const elArrowRight = document.querySelector('.arrow-right')


elPanelBtn.addEventListener('click', ()=> {
    elPanelBox.classList.toggle('paneLeft-show')
    elPanelBtn.classList.toggle('paneLeft__bnt-show')
    if(elPanelBtn.classList.contains('paneLeft__bnt-show')){
        elArrowLeft.style.display = 'block'
        elArrowRight.style.display = 'none'
    } else {
        elArrowRight.style.display = 'block'
        elArrowLeft.style.display = 'none'
    }

    
})

