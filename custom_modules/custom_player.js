const ytdl = require('ytdl-core');
var FFmpeg = require('fluent-ffmpeg');
const decoder = require('lame').Decoder
const Speaker = require('speaker');
const Volume = require("pcm-volume");
const fs = require("fs");
const mv = require('mv');
const diskspace = require('diskspace');


const dir = './mp3';

const customConfig = require("./custom_config");
const customDaemon = require("./custom_daemon");

customConfig.generatePlayConfigFile();
customConfig.generateUrlListFile();

let playConfig = customConfig.returnPlayConfig();
let urlList = customConfig.returnUrlList();

customDaemon.init(dir,downloadMp3,getUrlList,setFreespace);

let cSocket = null;

let decoded = null;
let speaker = null;
let volume = null;

let isUrlListFileLocked = false;
let nextUrl = null;
let nextResolve = null;
let nextReject = null;

let playStartedTime = null;

let retryCount = 0;
let freeSpace = 0;

setFreespace();

process.on('uncaughtException', function (error) {
    if (
        error.toString() == 'Error: Input stream error: This video is unavailable.' ||
        error.toString() == 'Error: Input stream error: This video is no longer available because the YouTube account associated with this video has been terminated.'
    ) {
        deleteList(playConfig["current_url"]);
        play(nextUrl).then(() => {
            if (nextResolve) {
                let tempResolve = nextResolve;
                nextResolve = null;
                tempResolve();
            }
        }).catch(() => {
            if (nextReject) {
                let tempReject = nextReject;
                nextReject = null
                tempReject();
            }
        });
    } else {
        console.log(error.toString())
        speaker = null;
        retryCount += 1;
        play(retryCount > 3 ? nextUrl : playConfig["current_url"]).then(() => {
            if (nextResolve) {
                let tempResolve = nextResolve;
                nextResolve = null;
                tempResolve();
            }
        }).catch(() => {
            if (nextReject) {
                let tempReject = nextReject;
                nextReject = null
                tempReject();
            }
        });;
    }
})


async function play(url = playConfig["current_url"], isForce = false) {
    return new Promise(async function (resolve, reject) {
        if (speaker) {
            nextUrl = url;
            stop();
            return;
        }
        const urlLength = urlList.length;
        if (urlLength == 0) {
            reject();
            return;
        }
        playConfig["current_url"] = url ? url : urlList[0]["url"];
        const currentIndex = getIndexFromUrl(playConfig["current_url"]);
        if (currentIndex >= urlLength) {
            playConfig["current_url"] = url;
        }
        savePlayConfig();
        nextUrl = getNextUrl();

        if (await isUrlFileExists(playConfig["current_url"])) {

            let fileStream = fs.createReadStream(`${dir}/${playConfig["current_url"]}`);

            decoded = fileStream.pipe(decoder());

            volume = new Volume();
            let volVal = playConfig["volume"] + (urlList[currentIndex]["vol"] ? parseFloat(urlList[currentIndex]["vol"]) : 0)
            if (volVal <= 0) {
                volVal = 0.1;
            }
            volume.setVolume(volVal);
            speaker = new Speaker({
                channels: 2,
                bitDepth: 16,
                sampleRate: 44100
            });
            decoded.pipe(volume);
            volume.pipe(speaker);


            speaker.on('flush', function () {
                playStartedTime = null;
                speaker = null;
                if (nextUrl) {
                    play(nextUrl);
                } else {
                    let jsonData = {
                        "isPlay": false,
                        "playStartedTime": null,
                        "list": {
                            "url": url
                        }
                    }
                    cSocket.emitAll('play', jsonData);
                }
            });
            speaker.on('open', function () {
                const videoInfo = urlList[currentIndex];
                console.log(`Playing ${currentIndex} - ${videoInfo['title']} - ${videoInfo['seconds']}sec`)

                playStartedTime = new Date().getTime();

                if (cSocket) {
                    let jsonData = {
                        "isPlay": true,
                        "playStartedTime": playStartedTime,
                        "list": {
                            "url": url,
                            "vol": urlList[currentIndex]["vol"],
                            "title": videoInfo['title'],
                            "seconds": videoInfo['seconds'],
                            "th": videoInfo["th"]
                        }
                    }
                    cSocket.emitAll('play', jsonData);
                }
                resolve();
            });
        } else {
            try{
                await downloadMp3(playConfig["current_url"])
                await play(playConfig["current_url"])
            }catch(e){
                throw(e);
            }
        }
    })
}

function stop(isForce) {
    if (speaker) {
        speaker.end();
        if (isForce) {
            nextUrl = null;
            nextResolve = null;
            nextReject = null;
        }
    }
}
function addList(url, title) {
    return new Promise(function (resolve, reject) {
        let newUrl = {}
        if (title) {
            newUrl = {
                "title": title,
                "url": url

            }
            let isRedendunted = false
            urlList = urlList.filter(v => {
                if (v["url"] == url) {
                    isRedendunted = true;
                    newUrl = v;
                }
                return v["url"] != url
            })
            urlList.push(newUrl);
            if (!nextUrl) {
                nextUrl = getNextUrl();
            }
            saveList().then(() => {
                let returnJSON = {
                    "isAdd": true,
                    "isRedendunted": isRedendunted,
                    "list": newUrl
                }
                cSocket.emitAll('addList', returnJSON);
                resolve();
            }).catch(err => {
                reject(err);
            });
        } else {
            ytdl.getInfo(url).then(vInfo => {
                const videoInfo = vInfo['player_response']['videoDetails'];
                newUrl = {
                    "title": videoInfo['title'],
                    "seconds": videoInfo['lengthSeconds'],
                    "url": videoInfo['videoId']
                }
                let isRedendunted = false
                urlList = urlList.filter(v => {
                    if (v["url"] == url) {
                        isRedendunted = true;
                        newUrl = v;
                    }
                    return v["url"] != url
                })
                urlList.push(newUrl);
                if (!nextUrl) {
                    nextUrl = getNextUrl();
                }
                saveList().then(() => {
                    let returnJSON = {
                        "isAdd": true,
                        "isRedendunted": isRedendunted,
                        "list": newUrl
                    }
                    cSocket.emitAll('addList', returnJSON);

                    resolve();
                }).catch(err => {
                    reject(err);
                });
            }).catch(err => {
                reject(err);
            })
        }
    });
}

function deleteList(url) {
    urlList = urlList.filter(v => {
        if (v["url"] == url) {
            console.log(`Deleted ${v['title']}`)
        }
        return v["url"] != url;
    });
    saveList();
}

function saveList() {
    return new Promise(function (resolve, reject) {
        customConfig.setUrlList(urlList).then(() => {
            resolve();
        }).catch(() => {
            reject();
        });
    });
}

function savePlayConfig() {
    return new Promise(function (resolve, reject) {
        customConfig.setPlayConfig(playConfig).then(() => {
            resolve();
        }).catch(() => {
            reject();
        });
    });
}

function getNextUrl() {
    let returnIndex = 0;
    const currentIndex = getIndexFromUrl(playConfig["current_url"]);
    switch (parseInt(playConfig["mode"])) {
        case 0:
            returnIndex = currentIndex + 1 >= urlList.length ? -1 : currentIndex + 1
            break;
        case 1:
            returnIndex = (currentIndex + 1) % urlList.length;
            break;
        case 2:
            if (urlList.length == 1) {
                returnIndex = 0;
            } else {
                while (true) {
                    returnIndex = Math.floor(Math.random() * urlList.length);
                    if (currentIndex != returnIndex) {
                        break;
                    }
                }
            }
            break;
        default:
            returnIndex = -1
            break;
    }
    return returnIndex == -1 ? null : urlList[returnIndex]["url"]
}

function getUrlList() {
    return urlList;
}

function returnIsPlaying() {
    return speaker != null;
}

function returnPlayConfig() {
    return playConfig;
}
function returnPlayStartedTime() {
    return playStartedTime;
}

function setvolume(vol) {
    if (volume) {
        const index = getIndexFromUrl(playConfig["current_url"]);
        let musicVol = 0
        if (index != -1) {
            if (urlList[index]["vol"]) {
                musicVol = parseFloat(urlList[index]["vol"])
            }
        }
        volume.setVolume(vol + musicVol);
    }
    playConfig.volume = vol;
    customConfig.setPlayConfig(playConfig);
}

function getIndexFromUrl(url) {
    for (let i in urlList) {
        if (urlList[i]["url"] == url) {
            return parseInt(i);
        }
    }
    return -1;
}
function setCSocket(_cSocket) {
    _cSocket.setCPlayer(this);
    cSocket = _cSocket;
}
function setMode(mode) {
    playConfig.mode = mode;
    nextUrl = getNextUrl();
    savePlayConfig();
}
function setMusicVolume(data) {
    const index = getIndexFromUrl(data["url"]);
    if (index != -1) {
        urlList[index]["vol"] = data["vol"];
        if (playConfig["current_url"] == data["url"]) {
            if (volume) {
                volume.setVolume(playConfig.volume + parseFloat(data["vol"]));
            }
        }
        saveList();
    }

}
async function downloadMp3(url) {
    let retryCount = 0;
    let lastDataSize = 0;
    try {
        await donwload(url);
        if (lastDataSize != 1) {
            console.log(`Retrying download ${url} :${retryCount++}`);
            downloaded(url);
        } else {
            fileMv(`${dir}/${url}_temp`,`${dir}/${url}`)
            console.log(`Fin download ${url}`);
        }
    } catch (e) {
        throw (e);
    }
    function donwload(url) {
        return new Promise(function (resolve, reject) {
            let dStream = null;
            let dProc = null;
            let dTrans = null;

            dStream = ytdl(url)
            dProc = new FFmpeg({
                source: dStream
            });
            try {
                dProc.setFfmpegPath(require('@ffmpeg-installer/ffmpeg').path);
            } catch (error) {
                dProc.setFfmpegPath('/usr/local/bin/ffmpeg');
            }
            dTrans = dProc.withAudioCodec('libmp3lame').toFormat('mp3');
            let fileStream = fs.createWriteStream(`${dir}/${url}_temp`);
            dTrans.pipe(fileStream);

            fileStream.on("finish", function () {
                resolve();
                setFreespace();
            });
            fileStream.on("error", function (err) {
                reject(err);
            })
            dStream.on("error", function (err) {
                reject(err);
            })
            dStream.on('progress', function (chunk, downloaded, total) {
                lastDataSize = downloaded / total;
            })
            dStream.on('info', function (vInfo, vFormat) {
                let videoInfo = {};
                const currentIndex = getIndexFromUrl(url);
                videoInfo = vInfo['player_response']['videoDetails'];
                urlList[currentIndex]["seconds"] = videoInfo['lengthSeconds'];
                urlList[currentIndex]["th"] = videoInfo["thumbnail"]["thumbnails"][0]["url"];
                saveList();
            })
        });
    }
}
function isUrlFileExists(url) {
    return new Promise(function (resolve, reject) {
        fs.exists(`${dir}/${url}`, function (exists) {
            resolve(exists);
        });
    });
}
function fileMv(source,dest){
    return new Promise(function (resolve, reject) {
        mv(source,dest,function(err){
            if (err){
                reject(err)
            }else{
                resolve();
            }
        });
    });
}
function getFreeSpace(){
    return freeSpace;
}
function setFreespace(){
    diskspace.check('/', function (err, result){
        if (err){
        }else{
            if (freeSpace != result["free"]){
                cSocket.emitAll('changed-free-space', result["free"]);
            }
            freeSpace = result["free"];
        }
    });
}

module.exports.play = play;
module.exports.stop = stop;
module.exports.addList = addList;
module.exports.getUrlList = getUrlList;
module.exports.returnIsPlaying = returnIsPlaying;
module.exports.returnPlayConfig = returnPlayConfig;
module.exports.returnPlayStartedTime = returnPlayStartedTime;
module.exports.setvolume = setvolume;
module.exports.deleteList = deleteList;
module.exports.setCSocket = setCSocket;
module.exports.setMode = setMode;
module.exports.setMusicVolume = setMusicVolume;
module.exports.getFreeSpace = getFreeSpace;