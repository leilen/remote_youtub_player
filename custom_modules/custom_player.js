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

let stream = null;
let proc = null;
let trans = null;
let decoded = null;
let speaker = null;
let volume = null;

let isUrlListFileLocked = false;
let isWillStop = false;
let nextUrl = null;
let nextResolve = null;
let nextReject = null;


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
        try {
            proc.setFfmpegPath(require('@ffmpeg-installer/ffmpeg').path);
        } catch (error) {
            proc.setFfmpegPath('/usr/local/bin/ffmpeg');
        }
        trans = proc.withAudioCodec('libmp3lame').toFormat('mp3');
        decoded = trans.pipe(decoder());
        volume = new Volume();
        volume.setVolume(playConfig["volume"]);
        speaker = new Speaker({
            channels: 2,
            bitDepth: 16,
            sampleRate: 44100
        });
        decoded.pipe(volume);
        volume.pipe(speaker);

        stream.on('progress', function (chunk, downloaded, total) {})
        stream.on('info', function (vInfo, vFormat) {
            const videoInfo = vInfo['player_response']['videoDetails'];
            console.log(`Playing ${currentIndex} - ${videoInfo['title']} - ${videoInfo['lengthSeconds']}sec`)
            resolve();
        })
        speaker.on('flush', function () {
            speaker = null;
            if (nextUrl) {
                play(nextUrl).then(() =>{
                    if (nextResolve){
                        let tempResolve = nextResolve;
                        nextResolve = null;
                        tempResolve();
                    }
                }).catch(() =>{
                    if (nextReject){
                        let tempReject = nextReject;
                        nextReject = null
                        tempReject();
                    }
                });
            }
        });
    })
}

function stop(isForce) {
    if (speaker) {
        speaker.end();
        if (isForce){
            nextUrl = null;
            nextResolve = null;
            nextReject = null;
        }
    }
}
function addList(url) {
    return new Promise(function (resolve, reject) {
        ytdl.getInfo(url).then(vInfo => {
            const videoInfo = vInfo['player_response']['videoDetails'];
            const newUrl = {
                "title": videoInfo['title'],
                "seconds": videoInfo['lengthSeconds'],
                "url": videoInfo['videoId']

            }
            urlList = urlList.filter(v => {
                return v["url"] != newUrl["url"]
            })
            urlList.push(newUrl);
            saveList().then(() => {
                resolve();
            }).catch(err => {
                reject(err);
            });
        }).catch(err => {
            reject(err);
        })
    });
}

function saveList() {
    return new Promise(function (resolve, reject) {
        customConfig.setUrlList(urlList).then(() =>{
            resolve();
        }).catch(() =>{
            reject();
        });
    });
}

function savePlayConfig() {
    return new Promise(function (resolve, reject) {
        customConfig.setPlayConfig(playConfig).then(() =>{
            resolve();
        }).catch(() =>{
            reject();
        });
    });
}

function getNextUrl() {
    let returnIndex = 0;
    const currentIndex = getIndexFromUrl(playConfig["current_url"]);
    switch (playConfig["mode"]) {
        case 0:
            returnIndex = currentIndex + 1 >= urlList.length ? -1 : currentIndex + 1
            break;
        case 1:
            returnIndex = (currentIndex + 1) % urlList.length;
            break;
        case 2:
            returnIndex = Math.floor(Math.random() * urlList.length);
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

function setvolume(vol) {
    if (volume) {
        volume.setVolume(vol);
        playConfig.volume = vol;
        customConfig.setPlayConfig(playConfig);
    }
}

function getIndexFromUrl(url) {
    for (let i in urlList) {
        if (urlList[i]["url"] == url) {
            return parseInt(i);
        }
    }
    return -1;
}

module.exports.play = play;
module.exports.stop = stop;
module.exports.addList = addList;
module.exports.getUrlList = getUrlList;
module.exports.returnIsPlaying = returnIsPlaying;
module.exports.returnPlayConfig = returnPlayConfig;
module.exports.setvolume = setvolume;