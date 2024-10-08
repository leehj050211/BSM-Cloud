let driveId, folderId, lastFolderId, lastFileId;
const dirBar = $('#dirs');

const dirView = Vue.createApp({
    data() {
        return {
            dirs: [{
                folderName:'내 드라이브',
                folderId:'root'
            }],
            dirIdx: 0
        }
    },
    updated() {
        this.$nextTick(function() {
            dirBar.scrollLeft = dirBar.scrollWidth;
        })
    }
}).mount('#dir_bar #dirs');

const filesView = Vue.createApp({
    data() {
        return {
            folders: [],
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
                created: '',
                isShare: false
            },
            folder: {
                folderId: '',
                folderName: ''
            },
            drive: {
                total: 0,
                used: 0
            },
            mode: 'normal',
            type: 'none'
        }
    },
    methods: {
        formatBytes: function(bytes) {
            return formatBytes(bytes);
        },
        changeMode: function(mode) {
            this.mode = mode;
            lastFolderId = folderId;
        },
        cancleMode: function() {
            this.mode = 'normal';
            selectItem(-1);
            enterDir(lastFolderId);
        }
    }
}).mount('#file_info_bar');

const fileShareView = Vue.createApp({
    data() {
        return {
            file: {
                fileId: '',
                isShare: false
            }
        }
    }
}).mount('#share_file_box');

const loadDriveId = () => {
    driveId = window.location.pathname.split('/')[2];
    folderId = window.location.pathname.split('/')[3];
    if (folderId === undefined || folderId == '') {
        folderId = 'root';
    }
    if (driveId) {
        loadFiles();
        return;
    }
    progress(20);
    ajax({
        method: 'get',
        url: 'drive/',
        callBack: data => {
            driveId = data.driveId;
            history.pushState(null, null, `/drive/${driveId}`);
            loadFiles();
        },
        errorCallback: data => {
            if (data.statusCode==404) {
                $('.dim.no_popup_close').classList.add('on');
                $('#create_drive_box').classList.add('on');
                return true;
            }
        }
    })
}

const loadFiles = () => {
    progress(20);
    ajax({
        method: 'get',
        url: `drive/${driveId}/${folderId}`,
        callBack: data => {
            history.pushState(null, null, `/drive/${driveId}/${folderId}`);
            $('#total_used_bar div').style.width = `${(data.usedStorage/data.totalStorage)*100}%`;
            dirView.dirs = [
                {
                    folderName:'내 드라이브',
                    folderId:'root'
                },
                ...data.dir
            ];
            dirView.dirIdx = data.dir.length;
            filesView.folders = data.folders;
            filesView.files = data.files;
            fileInfoView.drive = {
                total: data.totalStorage,
                used: data.usedStorage
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
        changeStep:function(step) {
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
        errorCallback: () => {
            createDriveBoxView.changeStep(0);
        }
    })
}

document.addEventListener('DOMContentLoaded', () => {
    loadDriveId();
})