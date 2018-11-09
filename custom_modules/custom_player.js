const fs = require('fs');
const ytdl = require('ytdl-core');
var FFmpeg = require('fluent-ffmpeg');
const decoder = require('lame').Decoder
const Speaker = require('speaker');
const Volume = require("pcm-volume");

const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');

if (!fs.existsSync('play_config.json')) {
    fs.writeFileSync("play_config.json", JSON.stringify(
        {
            "current_index" : 0, //number - url index now playing
            "mode" : 0, //number - 0 : normal , 1 : repeat , 2 : random
            "volumn" : 1 //number - 0 ~ 1 speaker volumn
        }
    ));
}
if (!fs.existsSync('url_list.json')) {
    // ../url_list.json[{
    //      "title" : string
    //      "seconds" : int - total play seconds
    //      "url" : string - youtube url
    //}]
    fs.writeFileSync("url_list.json", JSON.stringify([]));
}

let playConfig = require('../play_config.json');
let urlList = require("../url_list.json");

let stream = null;
let proc = null;
let trans = null;
let decoded = null;
let speaker = null;
let volumn = null;

let isUrlListFileLocked = false;
let isWillStop = false;


function play(index = playConfig["current_index"]) {
    return new Promise(function (resolve, reject) {
        if (speaker) {
            reject();
            return;
        }
        const urlLength = urlList.length;
        if (urlLength == 0) {
            reject();
            return;
        }
        isWillStop = false;
        playConfig["current_index"] = index;
        if (playConfig["current_index"] >= urlLength){
            playConfig["current_index"] = 0;
        }
        savePlayConfig();
        stream = ytdl(urlList[playConfig["current_index"]]["url"])
        proc = new FFmpeg({ source: stream });
        proc.setFfmpegPath(ffmpegInstaller.path);
        trans = proc.withAudioCodec('libmp3lame').toFormat('mp3');
        decoded = trans.pipe(decoder());
        volumn = new Volume();
        volumn.setVolume(playConfig["volumn"]);
        speaker = new Speaker();
        decoded.pipe(volumn);
        volumn.pipe(speaker);

        stream.on('progress', function (chunk, downloaded, total) {
        })
        stream.on('info', function (vInfo, vFormat) {
            const videoInfo = vInfo['player_response']['videoDetails'];
            console.log(`Playing ${playConfig["current_index"]} - ${videoInfo['title']} - ${videoInfo['lengthSeconds']}sec`)
            resolve();
        })
        speaker.on('flush', function () {
            speaker = null;
            if (isWillStop) {

            } else {
                const nextIndex = getNextIndex();
                if (nextIndex >= 0) {
                    play(nextIndex);
                }
            }
        });
    })
}

function stop() {
    return new Promise(function (resolve, reject) {
        if (speaker) {
            isWillStop = true;
            speaker.end();
            resolve();
        }else{
            reject();
        }
    });
}
function addList(url) {
    return new Promise(function (resolve, reject) {
        ytdl.getInfo(url).then(vInfo => {
            const videoInfo = vInfo['player_response']['videoDetails'];
            const newUrl = {
                "title": videoInfo['title'],
                "seconds": videoInfo['lengthSeconds'],
                "url": url

            }
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
        try {
            fs.writeFileSync("url_list.json", JSON.stringify(urlList));
            resolve();
        } catch (err) {
            reject(err);
        }
    });
}
function savePlayConfig() {
    return new Promise(function (resolve, reject) {
        try {
            fs.writeFileSync("play_config.json", JSON.stringify(playConfig), function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        } catch (err) {
            reject(err);
        }
    });
}
function getNextIndex() {
    switch (playConfig["mode"]) {
        case 0:
            return playConfig["current_index"] + 1 >= urlList.length ? -1 : playConfig["current_index"] + 1
            break;
        case 1:
            return (playConfig["current_index"] + 1) % urlList.length;
            break;
        case 2:
            return Math.floor(Math.random() * urlList.length);
            break;
        default:
            return -1;
            break;
    }
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
function setVolumn(vol){
    if (volumn){
        volumn.setVolume(vol);
    }
}

module.exports.play = play;
module.exports.stop = stop;
module.exports.addList = addList;
module.exports.getUrlList = getUrlList;
module.exports.returnIsPlaying = returnIsPlaying;
module.exports.returnPlayConfig = returnPlayConfig;
module.exports.setVolumn = setVolumn;