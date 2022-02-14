window.addEventListener('resize', () => {
    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
});
const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)
const themeInit = () => {
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
    const theme = localStorage.getItem('theme');
    if(theme=='light' || theme=='dark'){
        if(theme=='dark'){
            $(':root').classList.add('dark');
        }else{
            $(':root').classList.remove('dark');
        }
    }else{
        if(prefersDarkScheme.matches){
            localStorage.setItem('theme', 'dark');
            $(':root').classList.add('dark');
        }else{
            localStorage.setItem('theme', 'light');
            $(':root').classList.remove('dark');
        }
    }
}
const toggleTheme = () => {
    const theme = localStorage.getItem('theme');
    if(!(theme=='light' || theme=='dark')){
        themeInit()
        return;
    }
    if(theme=='dark'){
        $(':root').classList.remove('dark');
        localStorage.setItem('theme', 'light');
    }else{
        $(':root').classList.add('dark');
        localStorage.setItem('theme', 'dark');
    }
}
themeInit()

const popupOpen = (element) => {
    if($('.dim.popup_close')){
        if($$('.popup.on').length<1){
            $('.dim.popup_close').classList.add('on')
        }
    }
    element.classList.add('on')
}
const popupClose = (element) => {
    element.classList.remove('on')
    if($('.dim.popup_close')){
        if($$('.popup.on').length<1){
            $('.dim.popup_close').classList.remove('on')
        }
    }
}

let progressBar, progressBarFlag=0;
const progress = per => {
    if(progressBar.style.left=="0%"){
        if(per<100){
            progressBarFlag+=1;
            progressBar.style.left='-100%';
            progressBar.classList.add('on');
            window.setTimeout(()=>{
                progressBar.style.left=`${per-100}%`;
            }, 1)
        }
    }else{
        if(per>=100){
            window.setTimeout(()=>{
                if(progressBarFlag-1==0){
                    progressBar.classList.add('remove');
                }
                window.setTimeout(()=>{
                    progressBarFlag-=1;
                    if(progressBarFlag<1){
                        progressBar.classList.remove('on');
                        progressBar.classList.remove('remove');
                    }
                }, 450)
            }, 1000);
        }else{
            progressBar.classList.add('on');
        }
        progressBar.style.left=`${per-100}%`;
    }
}

window.addEventListener('DOMContentLoaded', () => {
    if($('.dim.popup_close')){
        $('.dim.popup_close').addEventListener('click', ()=>{
            $$('.popup').forEach(e => {
                popupClose(e);
            });
        })
    }
    progressBar = $('.progress');
})

const instance = axios.create({
    baseURL:'http://localhost:4001/api/',
    headers:{'Pragma':'no-cache'},
    timeout:3000,
})
const ajax = async ({method, url, payload, callBack, errorCallBack}) => {
    $('.loading').classList.add("on");
    let res
    try{
        const get = async () => {
            switch (method){
                case 'get':
                    return await instance.get(url, payload)
                case 'post':
                    return await instance.post(url, payload)
                case 'put':
                    return await instance.put(url, payload)
                case 'delete':
                    return await instance.delete(url, payload)
            }
        }
        res = await get(method)
        res = res.data
    }catch(err){
        console.log(err)
        loadingInit()
        showAlert(err)
        return;
    }
    try{
        callBack(res)
    }catch(err) {
        console.log(err)
        loadingInit()
        showAlert(err)
        return;
    }
    loadingInit()
}
const loadingInit = () => {
    $('.loading').classList.remove("on");
    progress(100)
}