var selectedPri = [];

function changePrivButtonAction(pid){
    getSelf ('/adm/api/get-priv-list', {'pid' : pid}, function(result){
        switch(result['code']){
            case 200:
                var listHtml= '';
                selectedPri = result['data'];
                for (i in result['data']){
                    listHtml += '\<option value=' + result['data'][i]['id-num'] + (result['data'][i]['is-selected'] ? ' selected' : '') + '\>' + result['data'][i]['name'] + '\<\/option\>';
                }
                $('select#priv-change').html(listHtml);
                $('button#modify-priv-post').attr('onclick','priorityModifyPostAction(' + pid + ')');
                $('select#priv-change').select2();
                $('.modal#changePriv').modal();
                break;
            case 402:
                alert('DB 에러!!');
                break;
            case 403:
                alert('권한이 없습니다.');
                break;
        }
    },function(err){
    });
    
}
function priorityModifyPostAction(pid){
    var selectedString = '';
    var diselectedString = '';
    for (i in selectedPri){
        if (selectedPri[i]['is-selected'] == false){
            $('select#priv-change :selected').each(function (j, selected) {
                if($(selected).val() == selectedPri[i]['id-num']){
                    selectedString += ($(selected).val() + '@#@#');
                }
            });
        }else{
            var flag = true;
            $('select#priv-change :selected').each(function (j, selected) {
                if($(selected).val() == selectedPri[i]['id-num']){
                    flag = false;
                }
            });
            if (flag){
                diselectedString += (selectedPri[i]['id-num'] + '@#@#');
            }
        }
    }
    var params = {
        'pid' : pid,
        'selected' : selectedString.substring(0, (selectedString.length-4)),
        'diselected' : diselectedString.substring(0, (diselectedString.length-4))
    };
    postSelf('/adm/api/modify-priv-list', params, function(result){
        switch(result['code']){
            case 200:
                alert('변경 완료.');
                window.location.reload();
                break;
            case 402:
                alert('DB 에러!!');
                break;
            case 403:
                alert('권한이 없습니다.');
                break;
        }
    }, function(err){
        alert('알수없는 에러!');
    });
}
function changePasswordButtonAction(pid){
    $('button#change-password-post').attr('onclick','changePasswordPost(' + pid + ')');
    $('.modal#changePassword').modal();
}
function changePasswordPost(pid){
    if ($('.modal#changePassword input#password').val().trim() == '') {
        alert('비밀번호를 입력해 주세요.');
        return false;
    }
    var params = {
        'pid' : pid,
        'password' : $('.modal#changePassword input#password').val().trim()
    };
    postSelf('/adm/api/change-password', params, function(result){
        switch(result['code']){
            case 200:
                alert('변경 완료.');
                window.location.reload();
                break;
            case 402:
                alert('DB 에러!!');
                break;
            case 403:
                alert('권한이 없습니다.');
                break;
        }
    }, function(err){
        alert('알수없는 에러!');
    });
}

$(document).ready(function() {
    $('select#priv-change').select2();
    $('#person-list-table').DataTable({
            responsive: true,
            paging: false,
            info:false
        });
    
    // $('.modal#changePassword').modal();
});