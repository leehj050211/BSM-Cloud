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
