const socketIO = require('socket.io');

let io = null;
let cPlayer = null;

function initIO(server) {
    io = socketIO(server);

    io.on("connection", onConnectionFunction);
}

function onConnectionFunction(socket) {
    sendDash(socket);
    socket.on('disconnect', () => {
    });
    socket.on('play', onPlayFunction);
    socket.on('volume', onVolumeFunction);
    socket.on('addList', onAddListFunction);
    socket.on('mode', onModeFunction);
    socket.on('musicVolume', onMusicVolumeFunction);
}

function emitAll(event, data) {
    io.sockets.emit(event, data);
}
function setCPlayer(_cPlayer) {
    cPlayer = _cPlayer;
}

async function onPlayFunction(data) {
    try {
        if (data["isPlay"]) {
            await cPlayer.play(data["url"]);
        } else {
            console.log("stop")
            await cPlayer.stop(true);
        }
    } catch (e) {
        console.log(e)
    }
}
function onVolumeFunction(data) {
    if (data["vol"]) {
        cPlayer.setvolume(data["vol"]);
        emitAll('volume', data);
    }
}
function onAddListFunction(data) {
    if (data["isAdd"]) {
        cPlayer.addList(data["url"]).then(returnedAddData => {
        });
    } else {
        cPlayer.deleteList(data["url"]);
        let returnJSON = {
            "isAdd": false,
            "list": { url: data["url"] }
        }
        emitAll('addList', returnJSON);
    }

}
function sendDash(socket) {
    let returnJSON = {
        "url-list": cPlayer.getUrlList(),
        "is-playing": cPlayer.returnIsPlaying(),
        "play-status": cPlayer.returnPlayConfig(),
        "free-space": cPlayer.getFreeSpace(),
        "play-started-time": cPlayer.returnPlayStartedTime()
    }
    socket.emit("loadDash", returnJSON);
}
function onModeFunction(data) {
    if (data["mode"]) {
        cPlayer.setMode(data["mode"]);
        emitAll('mode', data);
    }
}
function onMusicVolumeFunction(data) {
    cPlayer.setMusicVolume(data);
    emitAll('musicVolume', data);
}




module.exports.initIO = initIO;
module.exports.emitAll = emitAll;
module.exports.setCPlayer = setCPlayer;