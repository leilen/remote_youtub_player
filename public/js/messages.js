function attendButtonAction(did){
    console.log(did);
    postSelf('/api/process-delegated-attendance',{
        "did" : did
    },function(result){
        console.log(result);
        switch(result['code']){
            case 200:
                alert('처리 완료');
                location.reload();
                break;
            case 400:
                alert('파라메터 에러!');
                break;
            case 401:
                alert('이미 퇴근상태입니다');
                break;
            case 402:
                alert('DB ERROR');
                break;
            case 403:
                alert('권한이 없습니다');
                break;
            case 405:
                alert('퇴근 처리는 사무실에서만 가능합니다');
                break;
        }

    },function(error){
        alert('알수 없는 에러!!');
    });
}

$(document).ready(function(){
    $('#request-table').DataTable({
        order : [0,'desc'],
        info : false,
        paging : false,
        searching : false
    });
});