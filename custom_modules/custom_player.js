const fs = require('fs');
const ytdl = require('ytdl-core');
var FFmpeg = require('fluent-ffmpeg');
const decoder = require('lame').Decoder
const Speaker = require('speaker')

const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');

const url = 'https://www.youtube.com/watch?v=4dD5PMvx_gI';
let stream = null;
let proc = null;
let trans = null;
let decoded = null;
let speaker = null;

module.exports.play = function () {
    if (speaker){
        return;
    }
    stream = ytdl(url)
    proc = new FFmpeg({source: stream});
    proc.setFfmpegPath(ffmpegInstaller.path);
    trans = proc.withAudioCodec('libmp3lame').toFormat('mp3');
    decoded = trans.pipe(decoder());
    speaker = new Speaker();
    decoded.pipe(speaker);

    stream.on('progress',function(chunk,downloaded,total){
        console.log(downloaded / total);
    })
    speaker.on('open',function(data){
        console.log('open');
    })
    speaker.on('flush',function(){
        console.log('flush');
        speaker = null;
    })
}

module.exports.stop = function () {
    if (speaker){
        speaker.end();
    }
}