let driveId;
const filesView = Vue.createApp({
    data() {
        return {
            files: []
        }
    }
}).mount('#file_section #files');

const fileInfoView = Vue.createApp({
    data() {
        return {
            file: {
                fileName: '',
                fileId: '',
                created: ''
            }
        }
    }
}).mount('#file_info_bar');

const loadDriveId = () => {
    progress(20);
    driveId = window.location.pathname.split('/')[2];
    if (driveId) {
        history.pushState(null, null, `/drive/${driveId}`);
        loadFiles();
        return;
    }
    ajax({
        method: 'get',
        url: 'drive',
        callBack: data => {
            driveId = data.driveId;
            history.pushState(null, null, `/drive/${driveId}`);
            loadFiles();
        },
        errorCallBack: data => {
            if(data.statusCode==401){
                showAlert('로그인이 필요합니다');
                return true;
            }
            if(data.statusCode==404){
                popupOpen($('#create_drive_box'));
                return true;
            }
        }
    })
}

const loadFiles = () => {
    progress(50);
    ajax({
        method: 'get',
        url: `drive/${driveId}`,
        callBack: data => {
            filesView.files = data;
        }
    })
}

const createDriveBoxView = Vue.createApp({
    data() {
        return {
            step: 0,
            id: ''
        }
    },
    methods: {
        changeStep:function(step){
            this.step=step;
        }
    }
}).mount('#create_drive_box');

const createDrive = () => {
    ajax({
        method: 'post',
        url: `drive`,
        callBack: data => {
            createDriveBoxView.id=data.driveId;
            createDriveBoxView.changeStep(2);
            loadDriveId();
        },
        errorCallBack: () => {
            createDriveBoxView.changeStep(0);
        }
    })
}

document.addEventListener('DOMContentLoaded', () => {
    loadDriveId();
})