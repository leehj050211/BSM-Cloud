const selectFile = fileIdx => {
    filesView.focus = filesView.files[fileIdx].fileId;
    fileInfoView.file = filesView.files[fileIdx];
}

const uploadFile = (file, fileId) => {
    if(!file){
        return;
    }
    const url = !fileId? `drive/${driveId}`: `drive/${driveId}/${fileId}`;
    const method = !fileId? 'post': 'put';
    let form = new FormData();
    form.append('file', file);
    showToast('업로드 중입니다. 파일 크기에 따라 시간이 다소 소요될 수 있습니다.');
    ajax({
        method:method,
        payload:form,
        url:url,
        config:{
            timeout:0,
            onUploadProgress: event => {
                let percent = (event.loaded*100)/event.total;
                if(percent==100){
                    showToast('업로드 완료. 준비 중입니다 잠시 기다려주세요.');
                }else{
                    progress(percent);
                }
            }
        },
        callBack:()=>{
            showToast('업로드가 완료되었습니다.');
            loadFiles();
        }
    })
}

const downloadFile = async (fileId) => {
    try{
        showToast('다운로드 중입니다. 파일 크기에 따라 시간이 다소 소요될 수 있습니다.');
        const res = await axios({
            method:'get',
            url:`/api/drive/${driveId}/${fileId}`,
            responseType:'blob',
            onDownloadProgress: event => {
                let percent = (event.loaded*100)/event.total;
                if(percent==100){
                    showToast('다운로드 완료. 준비 중입니다 잠시 기다려주세요.');
                }else{
                    progress(percent);
                }
            }
        });
        const filename = res.headers["content-disposition"].split("filename=")[1].replace(/"/g, "");
        const fileUrl = window.URL.createObjectURL(new Blob([res.data], {type:res.headers['content-type']}));
        const link = document.createElement('a');
        link.href = fileUrl;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        delete link;
        progress(100);
    }catch(err){
       console.error(err);
       showAlert('다운로드중 문제가 발생하였습니다');
       progress(100);
    }
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
            filesView.focus = -1;
            fileInfoView.file = {
                fileName: '',
                fileId: '',
                created: ''
            }
        }
    })
}