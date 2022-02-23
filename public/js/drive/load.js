let driveId;

const filesView = Vue.createApp({
    data() {
        return {
            files: [],
            focus: -1
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
            },
            drive: {
                total: 0,
                used: 0
            }
        }
    },
    methods: {
        formatBytes: function(bytes){
            return formatBytes(bytes)
        }
    }
}).mount('#file_info_bar');

const loadDriveId = () => {
    progress(20);
    driveId = window.location.pathname.split('/')[2];
    if (driveId) {
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
                $('.dim.no_popup_close').classList.add('on');
                $('#create_drive_box').classList.add('on');
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
            $('#total_used_bar div').style.width = `${(data.used/data.total)*100}%`;
            filesView.files = data.files;
            fileInfoView.drive = {
                total: data.total,
                used: data.used
            }
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