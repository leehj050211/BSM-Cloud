let fileId;

const fileInfoView = Vue.createApp({
    data() {
        return {
            file: {
                fileId: '',
                fileName: '',
                size: 0,
                created: ''
            }
        }
    },
    methods: {
        formatBytes: function(bytes){
            return formatBytes(bytes)
        }
    }
}).mount('#file_info');

const loadFile = () => {
    progress(20);
    fileId = window.location.pathname.split('/')[2];
    ajax({
        method: 'get',
        url: `share/${fileId}`,
        callBack: data => {
            fileInfoView.file = {
                fileId: fileId,
                fileName: data.fileName,
                size: data.size,
                created: data.created
            }
        }
    })
}

const downloadFile = async (fileId) => {
    ajax({
        method:'get',
        url:`/share/download/${fileId}`,
        rawResPass:true,
        config:{
            responseType:'blob',
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
            const filename = res.headers["content-disposition"].split("filename=")[1].replace(/"/g, "");
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

document.addEventListener('DOMContentLoaded', () => {
    loadFile();
})