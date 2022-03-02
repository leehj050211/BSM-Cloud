const selectFile = fileIdx => {
    filesView.focus = filesView.files[fileIdx].fileId;
    fileInfoView.file = filesView.files[fileIdx];
    fileShareView.file = filesView.files[fileIdx];
}

const uploadFile = (file, fileId) => {
    if(!file){
        return;
    }
    const url = !fileId? `drive/upload/${driveId}`: `drive/upload/${driveId}/${fileId}`;
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
    ajax({
        method:'get',
        url:`/drive/${driveId}/${fileId}`,
        rawResPass:true,
        config:{
            responseType:'blob',
            timeout:0,
            onDownloadProgress: event => {
                let percent = (event.loaded*100)/event.total;
                if(percent==100){
                    showToast('다운로드 완료. 준비 중입니다 잠시 기다려주세요.');
                }else{
                    progress(percent);
                }
            }
        },
        callBack:res=>{
            showToast('다운로드 중입니다. 파일 크기에 따라 시간이 다소 소요될 수 있습니다.');
            let filename
            if(res.headers["content-disposition"].indexOf("filename*=UTF-8''")<0){
                filename = res.headers["content-disposition"].split("filename=")[1].replace(/"/g, "");
            }else{
                filename = decodeURIComponent(res.headers["content-disposition"].split("filename*=UTF-8''")[1]?.replace(/"/g, ""));
            }

            const fileUrl = window.URL.createObjectURL(new Blob([res.data], {type:res.headers['content-type']}));
            const link = document.createElement('a');
            link.href = fileUrl;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            delete link;
        }
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
            filesView.focus = -1;
            fileInfoView.file = {
                fileName: '',
                fileId: '',
                created: ''
            }
        }
    })
}

const shareFile = async (fileId, flag) => {
    if(flag){
        if(!confirm('파일을 공유하시겠습니까?')){
            return;
        }
    }else{
        if(!confirm('파일 공유를 해제하시겠습니까?')){
            return;
        }
    }
    ajax({
        method:'post',
        url:`drive/share/${driveId}/${fileId}`,
        payload:{
            share:flag
        },
        callBack:()=>{
            showToast("파일 공유 설정이 변경되었습니다");
            loadFiles();
            filesView.focus = -1;
            fileInfoView.file = {
                fileName: '',
                fileId: '',
                created: ''
            }
            popupClose($('#share_file_box'));
            if(flag){
                const fileUrl = `https://drive.bssm.kro.kr/share/${fileId}`;
                navigator.clipboard.writeText(fileUrl);
                $('#share_file_url').innerText = fileUrl;
                $('#share_file_url').href = fileUrl;
                popupOpen($('#file_url_box'));
            }
        }
    })
}

const shareFileCode = async (fileId) => {
    if(!confirm('파일을 간편 공유 하시겠습니까?')){
        return;
    }
    ajax({
        method:'post',
        url:`drive/code/${driveId}/${fileId}`,
        callBack:data=>{
            showToast("간편 공유가 완료되었습니다");
            popupClose($('#share_file_box'))
            const shareCode = data.shareCode;
            navigator.clipboard.writeText(shareCode);
            $('#share_file_code').innerText = shareCode;
            popupOpen($('#share_file_code_box'));
        }
    })
}