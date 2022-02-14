const showAlert = msg => {
    $('.alert_wrap').innerHTML='<div class="alert">'+msg+'</div>'
    window.setTimeout(()=>{
        if($('.alert_wrap div')){
            $('.alert_wrap div').classList.add("remove")
        }
        window.setTimeout(()=>{
            $('.alert_wrap').innerHTML=''
        }, 200)
    }, 5000)
}
const showToast = msg => {
    $('.toast_wrap').append(document.createElement('div'))
    $$('.toast_wrap div')[$$('.toast_wrap div').length-1].innerHTML='<div class="toast">'+msg+'</div>'
    window.setTimeout(()=>{
        $('.toast_wrap div div').classList.add("remove")
        window.setTimeout(()=>{
            $('.toast_wrap div').remove()
        }, 200)
    }, 5000)
}