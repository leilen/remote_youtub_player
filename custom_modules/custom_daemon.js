const fs = require("fs");
const customConfig = require("./custom_config");


let downloadMp3 = null;
let returnUrlList = null;
let setFreespace = null;

let dir = './';

function getCurrentFileList() {
    return new Promise(async function (resolve, reject) {
        fs.readdir(dir, (err, files) => {
            if (err) {
                reject(err);
            } else {
                files = files.filter(v => (v != '.keep'));
                resolve(files);
            }
        });
    });
}
async function daemon(inUrlArrData) {
    const urlArrData = inUrlArrData ? inUrlArrData : await returnWillDownloadUrlArr();
    const urlArr = urlArrData.willDownloadUrlArr;
    const deleteUrlArr = urlArrData.willDeleteUrlArr;
    if (deleteUrlArr.length > 0) {
        console.log(`Will delete ${deleteUrlArr.length} urls`)
        for (v of deleteUrlArr) {
            try {
                await deleteUrlFile(v);
            } catch (e) {
                console.log(e)
            }
        }
        setFreespace();
    }
    if (urlArr.length > 0) {
        console.log(`Will download ${urlArr.length} urls`)
        for (v of urlArr) {
            try {
                await downloadMp3(v);
            } catch (e) {
                console.log(e)
            }
        }
    }
    const newUrlArrData = await returnWillDownloadUrlArr();
    const newUrlArr = newUrlArrData.willDownloadUrlArr;
    if (newUrlArr.length > 0) {
        daemon(newUrlArrData);
    } else {
        setTimeout(function () {
            daemon(newUrlArrData);
        }, 1000);
    }
}
async function returnWillDownloadUrlArr() {
    const downloadedUrlArr = await getCurrentFileList();
    const returnUrlListData = returnUrlList().map(v => (v["url"]));
    let urlArr = returnUrlListData.filter(v => (downloadedUrlArr.indexOf(v) < 0))
    let deleteUrlArr = downloadedUrlArr.filter(v => (returnUrlListData.indexOf(v) < 0))

    return { "willDownloadUrlArr": urlArr, "willDeleteUrlArr": deleteUrlArr };
}
function deleteUrlFile(url) {
    return new Promise(function (resolve, reject) {
        fs.unlink(`${dir}/${url}`, (err) => {
            if (err) {
                reject(err)
            } else {
                console.log(`Deleted ${dir}/${url}`);
                resolve();
            }
        });
    });
}

module.exports.init = async function (inDir, inDownloadMp3, inReturnUrlList,inSetFreespace) {
    downloadMp3 = inDownloadMp3;
    returnUrlList = inReturnUrlList;
    setFreespace = inSetFreespace;
    dir = inDir;
    try {
        await daemon();
    } catch (e) {
        console.log(e)
    }
}
