const fs = require('fs');
const ytdl = require('ytdl-core');
var FFmpeg = require('fluent-ffmpeg');
const decoder = require('lame').Decoder
const Speaker = require('speaker');
const Volume = require("pcm-volume");

if (!fs.existsSync('play_config.json')) {
    fs.writeFileSync("play_config.json", JSON.stringify({
        "current_url": null, //number - url index now playing
        "mode": 0, //number - 0 : normal , 1 : repeat , 2 : random
        "volumn": 1 //number - 0 ~ 1 speaker volumn
    }));
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
let nextUrl = null;
let nextResolve = null;
let nextReject = null;


function play(url = playConfig["current_url"], isForce = false) {
    return new Promise(function (resolve, reject) {
        if (isForce) {
            nextUrl = url
            stop();
            if (!speaker) {
                play(url).then(() =>{
                    resolve();
                }).catch(() =>{
                    reject();
                });
            }else{
                nextResolve = resolve;
                nextReject = reject;
            }
        } else {
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
            nextUrl = null;
            playConfig["current_url"] = url ? url : urlList[0]["url"];
            const currentIndex = getIndexFromUrl(playConfig["current_url"]);
            if (currentIndex >= urlLength) {
                playConfig["current_url"] = url;
            }
            savePlayConfig();
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
            volumn = new Volume();
            volumn.setVolume(playConfig["volumn"]);
            speaker = new Speaker({
                channels: 2,
                bitDepth: 16,
                sampleRate: 44100
            });
            decoded.pipe(volumn);
            volumn.pipe(speaker);

            stream.on('progress', function (chunk, downloaded, total) {})
            stream.on('info', function (vInfo, vFormat) {
                const videoInfo = vInfo['player_response']['videoDetails'];
                console.log(`Playing ${currentIndex} - ${videoInfo['title']} - ${videoInfo['lengthSeconds']}sec`)
                resolve();
            })
            speaker.on('flush', function () {
                speaker = null;
                if (isWillStop) {

                } else if (nextUrl) {
                    play(nextUrl).then(() =>{
                        let tempResolve = nextResolve;
                        nextResolve = null;
                        tempResolve();
                    }).catch(() =>{
                        let tempReject = nextReject;
                        nextReject = null
                        tempReject();
                    });
                } else {
                    const nextUrl = getNextUrl();
                    if (nextUrl) {
                        play(nextUrl);
                    }
                }
            });
        }
    })
}

function stop() {
    if (speaker) {
        if (!nextUrl) {
            isWillStop = true;
        }
        speaker.end();
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

function setVolumn(vol) {
    if (volumn) {
        volumn.setVolume(vol);
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
module.exports.setVolumn = setVolumn;