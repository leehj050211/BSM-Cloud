const progressBar = $('.progress');
let progressBarFlag=0;
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
})

const instance = axios.create({
    baseURL:'https://drive.bssm.kro.kr/api/',
    headers:{'Pragma':'no-cache'},
    timeout:3000,
})
const ajax = async ({method, url, payload, config, callBack, errorCallBack}) => {
    $('.loading').classList.add("on");
    let res;
    try{
        const get = async () => {
            switch (method){
                case 'get':
                    return await instance.get(url, config);
                case 'post':
                    return await instance.post(url, payload, config);
                case 'put':
                    return await instance.put(url, payload, config);
                case 'delete':
                    return await instance.delete(url, config);
            }
        }
        res = await get(method);
        res = res.data;
    }catch(err){
        console.log(err);
        loadingInit();
        if(!err.response){
            showAlert(err);
            return;
        }
        if(!err.response.data){
            showAlert(`HTTP ERROR ${err.response.status}`);
            return;
        }
        if(!err.response.data.statusCode){
            if(err.response.status==413){
                showAlert(`HTTP ERROR ${err.response.status} 파일 크기가 너무 큽니다.`);
            }else{
                showAlert(`HTTP ERROR ${err.response.status}`);
            }
            return;
        }
        if(errorCallBack && errorCallBack(err.response.data)){
            return;
        }
        showAlert(`에러코드: ${err.response.data.statusCode} ${err.response.data.message}`);
        return;
    }
    try{
        callBack(res);
    }catch(err) {
        console.log(err);
        loadingInit();
        showAlert('알 수 없는 에러가 발생하였습니다');
        return;
    }
    loadingInit();
}
const loadingInit = () => {
    $('.loading').classList.remove("on");
    progress(100);
}