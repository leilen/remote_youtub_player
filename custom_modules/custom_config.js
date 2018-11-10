const fs = require("fs");

module.exports.generateConfigFile = function () {
    const defaultConfigJson = {
        "server_port": 3000,
        "mode": "dev"
    };
    if (!fs.existsSync("config")) {
        fs.mkdirSync("config");
        fs.writeFileSync("config/config.json", JSON.stringify(defaultConfigJson));
    }else{
        if (!fs.existsSync("config/config.json")) {
            fs.writeFileSync("config/config.json", JSON.stringify(defaultConfigJson));
        }
    }
}

function generatePlayConfigFile () {
    if (!fs.existsSync('config/play_config.json')) {
        fs.writeFileSync("config/play_config.json", JSON.stringify({
            "current_url": null, //number - url index now playing
            "mode": 0, //number - 0 : normal , 1 : repeat , 2 : random
            "volumn": 1 //number - 0 ~ 1 speaker volumn
        }));
    }
}

function generateUrlListFile() {
    if (!fs.existsSync('config/url_list.json')) {
        // ../url_list.json[{
        //      "title" : string
        //      "seconds" : int - total play seconds
        //      "url" : string - youtube url
        //}]
        fs.writeFileSync("config/url_list.json", JSON.stringify([]));
    }
}

module.exports.returnPlayConfig = function (){
    return require("../config/play_config.json");
}
module.exports.returnUrlList = function (){
    return require("../config/url_list.json");
}
module.exports.setPlayConfig = function (playConfig){
    return new Promise(function (resolve, reject) {
        fs.writeFile("config/play_config.json", JSON.stringify(playConfig), function(err) {
            if (err){
                reject();
            }else{
                resolve();
            }
        });
    });
}
module.exports.setUrlList = function (urlList){
    return new Promise(function (resolve, reject) {
        fs.writeFile("config/url_list.json", JSON.stringify(urlList), function(err) {
            if (err){
                reject();
            }else{
                resolve();
            }
        });
    });
}

module.exports.generatePlayConfigFile = generatePlayConfigFile;
module.exports.generateUrlListFile = generateUrlListFile;