const selectFile = fileIdx => {
    filesView.focus = fileIdx;
    fileInfoView.file = filesView.files[fileIdx];
}

const uploadFile = (file) => {
    if(!file){
        return;
    }
    let form = new FormData();
    form.append('file', file);
    showToast('파일 업로드 중입니다. 파일 크기에 따라 시간이 다소 소요될 수 있습니다.');
    ajax({
        method:'post',
        payload:form,
        url:`drive/${driveId}`,
        config:{
            timeout:0,
            onUploadProgress: event => {
                let percent = (event.loaded*100)/event.total;
                if(percent==100){
                    showToast('파일 업로드 완료. 준비 중입니다 잠시 기다려주세요.');
                }else{
                    progress(percent);
                }
            }
        },
        callBack:()=>{
            showToast('파일 업로드가 완료되었습니다.');
            loadFiles();
        }
    })
}

const downloadFile = async (fileId) => {
    const file = await getFileDownloadInfo(fileId);
    try{
        showToast('파일 다운로드 중입니다. 파일 크기에 따라 시간이 다소 소요될 수 있습니다.');
        const res = await axios({
            method:'get',
            url:`/storage/${driveId}/${file.fileName}`,
            responseType:'blob',
            onDownloadProgress: event => {
                let percent = (event.loaded*100)/event.total;
                if(percent==100){
                    showToast('파일 다운로드 완료. 준비 중입니다 잠시 기다려주세요.');
                }else{
                    progress(percent);
                }
            }
        });
        const fileUrl = window.URL.createObjectURL(new Blob([res.data], {type:res.headers['content-type']}));
        const link = document.createElement('a');
        link.href = fileUrl;
        link.setAttribute('download', file.originalName);
        document.body.appendChild(link);
        link.click();
        delete link;
        progress(100);
    }catch(err){
       console.error(err);
       showAlert('파일 다운로드중 문제가 발생하였습니다');
       progress(100);
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

const deleteFile = async (fileId) => {
    if(!confirm('정말 파일을 삭제하시겠습니까?')){
        return;
    }
    ajax({
        method:'delete',
        url:`drive/${driveId}/${fileId}`,
        callBack:()=>{
            showToast("파일이 삭제되었습니다");
            loadFiles();
        }
    })
}