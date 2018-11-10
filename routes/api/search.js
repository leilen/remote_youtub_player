const Youtube = require('youtube-node');

module.exports = function(req, res, next, db, log, cRes, jwt,cPlayer) {
    const ytKey = require("../../config/config.json")["yt_key"];
    if (!ytKey){
        cRes.sendParameterJSON(res);
        return;
    }
    if (!req.query["keyword"]){
        cRes.sendParameterJSON(res);
        return;
    }
    const youtube = new Youtube();

    var word = req.query["keyword"]
    var limit = 30;  // 출력 갯수

    youtube.setKey(ytKey); // API 키 입력

    // youtube.addParam('order', 'rating'); // 평점 순으로 정렬
    // youtube.addParam('type', 'video');   // 타입 지정
    // youtube.addParam('videoLicense', 'creativeCommon'); // 크리에이티브 커먼즈 아이템만 불러옴
    // youtube.addParam("pageToken","CBQQAA");
    let params = {
        "type" : "video"
    };
    console.log(req.query);
    if(req.query["page-token"]){
        params["pageToken"] = req.query["page-token"];
    }


    youtube.search(word, limit,params, function (err, result) { // 검색 실행
        if (err) {
            console.log(err);
            cRes.sendErrorJSON(res,401);
        }else{
            // console.log(JSON.stringify(result, null, 2)); // 받아온 전체 리스트 출력
            // console.log(result["items"]);
            const list = result["items"].map(v =>{
                return {
                    "url" : v["id"]["videoId"],
                    "th" : v["snippet"]["thumbnails"]["medium"]["url"],
                    "title" : v["snippet"]["title"],
                    "desc" : v["snippet"]["description"]
                }
            })

            const returnData = {
                "page-info" : result["pageInfo"],
                "next-page-token" : result["nextPageToken"],
                "list" : list
            }
            cRes.sendOKJSON(res,returnData);
        }
    });
}