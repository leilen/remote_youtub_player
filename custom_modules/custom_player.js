const ytdl = require('ytdl-core');
var FFmpeg = require('fluent-ffmpeg');
const decoder = require('lame').Decoder
const Speaker = require('speaker');
const Volume = require("pcm-volume");

const customConfig = require("./custom_config");

customConfig.generatePlayConfigFile();
customConfig.generateUrlListFile();

let playConfig = customConfig.returnPlayConfig();
let urlList = customConfig.returnUrlList();

let cSocket = null;

let stream = null;
let proc = null;
let trans = null;
let decoded = null;
let speaker = null;
let volume = null;

let isUrlListFileLocked = false;
let nextUrl = null;
let nextResolve = null;
let nextReject = null;

let playStartedTime = null;

let retryCount = 0;
let lastDataSize = 0;

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


function play(url = playConfig["current_url"], isForce = false) {
    return new Promise(function (resolve, reject) {
        if (speaker) {
            nextUrl = url;
            nextResolve = resolve;
            nextReject = reject;
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
        stream = ytdl(playConfig["current_url"])
        proc = new FFmpeg({
            source: stream
        });
        // .setStartTime(100).setDuration(10)
        try {
            proc.setFfmpegPath(require('@ffmpeg-installer/ffmpeg').path);
        } catch (error) {
            proc.setFfmpegPath('/usr/local/bin/ffmpeg');
        }
        trans = proc.withAudioCodec('libmp3lame').toFormat('mp3');
        decoded = trans.pipe(decoder());
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


        let videoInfo = {};
        stream.on('progress', function (chunk, downloaded, total) {
            console.log('progress',downloaded/total,total); 
            lastDataSize = downloaded/total;
            setTimeout(checkIsAborted,10000,downloaded/total);
        })
        stream.on('info', function (vInfo, vFormat) {
            videoInfo = vInfo['player_response']['videoDetails'];
            retryCount = 0;
        })
        speaker.on('flush', function () {
            if (retryCount != 0){
                return;
            }
            playStartedTime = null;
            speaker = null;
            if (nextUrl) {
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
            if (!urlList[currentIndex]["seconds"]) {
                urlList[currentIndex]["seconds"] = videoInfo['lengthSeconds'];
                saveList();
            }
            urlList[currentIndex]["th"] = videoInfo["thumbnail"]["thumbnails"][0]["url"];
            console.log(`Playing ${currentIndex} - ${videoInfo['title']} - ${videoInfo['lengthSeconds']}sec`)

            playStartedTime = new Date().getTime();

            if (cSocket) {
                let jsonData = {
                    "isPlay": true,
                    "playStartedTime": playStartedTime,
                    "list": {
                        "url": url,
                        "vol": urlList[currentIndex]["vol"],
                        "title": videoInfo['title'],
                        "seconds": videoInfo['lengthSeconds'],
                        "th": videoInfo["thumbnail"]["thumbnails"][0]["url"]
                    }
                }
                cSocket.emitAll('play', jsonData);
            }
            resolve();
        });
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
        if (v["url"] == url){
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
function checkIsAborted(beforeDataSize){
    if (beforeDataSize == 1){
        return;
    }
    if (beforeDataSize == lastDataSize){
        stop();
    }
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