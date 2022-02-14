let driveId;
const filesView = Vue.createApp({
    data() {
        return {
            files: []
        }
    }
}).mount('#file_section #files');

const loadDriveId = () => {
    driveId = window.location.pathname.split('/')[2];
    if (!driveId) {
        ajax({
            method: 'get',
            url: 'drive',
            callBack: data => {
                driveId = data.driveId;
                history.pushState(null, null, `/drive/${driveId}`);
                loadFiles();
            }
        })
    }else{
        history.pushState(null, null, `/drive/${driveId}`);
        loadFiles();
    }
}

const loadFiles = () => {
    ajax({
        method: 'get',
        url: `drive/${driveId}`,
        callBack: data => {
            filesView.files = data;
        }
    })
}
document.addEventListener('DOMContentLoaded', () => {
    loadDriveId();
})