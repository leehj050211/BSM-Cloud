const selectFile = fileIdx => {
    fileInfoView.file = filesView.files[fileIdx]
}

const uploadFile = (file) => {
    if(!file){
        return;
    }
    let form = new FormData();
    form.append('file', file);
    showToast('파일 업로드 중입니다. 파일 크기에따라 시간이 다소 소요될 수 있습니다.');
    ajax({
        method:'post',
        payload:form,
        url:`drive/${driveId}`,
        config:{
            timeout:0
        },
        callBack:data=>{
            loadFiles();
        }
    })
}

const downloadFile = async (fileId) => {
    const file = await getFileDownloadInfo(fileId);
    try{
        showToast('파일 다운로드 중입니다. 파일 크기에따라 시간이 다소 소요될 수 있습니다.');
        const res = await axios({
            method:'get',
            url:`/drive/${driveId}/${file.fileName}`,
            responseType:'blob'
        });
        const fileUrl = window.URL.createObjectURL(new Blob([res.data], {type:res.headers['content-type']}));
        const link = document.createElement('a');
        link.href = fileUrl;
        link.setAttribute('download', file.originalName);
        document.body.appendChild(link);
        link.click()
        delete link;
    }catch(err){
       console.error(err);
       showAlert('파일 다운로드중 문제가 발생하였습니다');
    }
}

const getFileDownloadInfo = (fileId) => {
    return new Promise(resolve => {
        ajax({
            method:'get',
            url:`drive/${driveId}/${fileId}`,
            callBack:data=>{
                resolve(data)
            }
        })
    })
}