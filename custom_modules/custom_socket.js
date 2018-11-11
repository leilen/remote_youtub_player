const socketIO = require('socket.io');

let io = null;
let cPlayer = null;

function initIO(server) {
    io = socketIO(server);

    io.on("connection", onConnectionFunction);
}

function onConnectionFunction(socket) {
    socket.on('disconnect', () => {
    });
    socket.on('play', onPlayFunction);
    socket.on('volume', onVolumeFunction);
    socket.on('addList', onAddListFunction);
}

function emitAll(event, data) {
    io.sockets.emit(event, data);
}
function setCPlayer(_cPlayer) {
    cPlayer = _cPlayer;
}

function onPlayFunction(data) {
    if (data["isPlay"]) {
        cPlayer.play(data["url"]);
    } else {
        cPlayer.stop(true);
    }
}
function onVolumeFunction(data) {
    if (data["vol"]) {
        cPlayer.setvolume(data["vol"]);
        emitAll('volume', data);
    }
}
function onAddListFunction(data) {
    if (data["isAdd"]){
        cPlayer.addList(data["url"]).then(returnedAddData =>{
        });
    }else{
        cPlayer.deleteList(data["url"]);
        let returnJSON = {
            "isAdd" : false,
            "list" : {url : data["url"]}
        }
        emitAll('addList', returnJSON);
    }
    
}




module.exports.initIO = initIO;
module.exports.emitAll = emitAll;
module.exports.setCPlayer = setCPlayer;