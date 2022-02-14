if(navigator.platform && /Mac|iPad|iPhone|iPod/.test(navigator.platform)){
    $('.notice_bar').innerHTML+='<div class="notice yellow">IOS환경에서는 제대로 동작하지 않을 수 있습니다.</div>';
}
window.addEventListener('online', ()=>{
    if($$('.notice_bar .offline').length){
        $('.notice_bar .offline').remove()
    }
})
window.addEventListener('offline', ()=>{
    $('.notice_bar').innerHTML+='<div class="notice red offline">인터넷에 연결되어있지 않습니다.</div>'
})
if(!window.navigator.onLine){
    $('.notice_bar').innerHTML+='<div class="notice red offline">인터넷에 연결되어있지 않습니다.</div>'
}
window.addEventListener('DOMContentLoaded', () => {
    const header = $('header')
    // 일정 이상 스크롤할 시 상단 메뉴바가 작아짐
    window.addEventListener('scroll', () => {
        if(window.scrollY >= 51){
            header.classList.add('on')
        }else{
            header.classList.remove('on')
        }
    })
})

const headerAccountView = new Vue({
    el:'.user_menu',
    data:{
        member:member,
        memberLevel:memberLevel
    }
})