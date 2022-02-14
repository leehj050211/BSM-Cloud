const selectFile = fileIdx => {
    fileInfoView.file = filesView.files[fileIdx]
}

const uploadFile = (file) => {
    if(!file){
        return;
    }
    let form = new FormData();
    form.append('file', file);
    ajax({
        method:'post',
        payload:form,
        url:`drive/${driveId}`,
        callBack:data=>{
            loadFiles();
        }
    })
}