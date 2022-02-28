const loadFile = (code) => {
    progress(20);
    ajax({
        method: 'get',
        url: `share/code/${code}`,
        callBack: data => {
            window.location = `/code/${code}`;
        },
        errorCallback: data => {
            if(data.statusCode == 404){
                showAlert('파일을 찾을 수 없습니다');
                return true;
            }
        }
    })
}