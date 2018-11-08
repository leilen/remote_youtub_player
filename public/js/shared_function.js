function postSelf(url, data, successHandler, errorHandler) {
    $.ajax({
        url: url,
        data: data,
        type: 'POST',
        error: function (error) {
            if (errorHandler != undefined) {
                errorHandler(error);
            }
        },
        success: function (result) {
            successHandler(result);
        }
    });
};
var postSelfWithFile = function (url, data, successHandler, errorHandler) {
    $.ajax({
        url: url,
        processData: false,
        contentType: false,
        data: data,
        type: 'POST',
        error: function (error) {
            if (errorHandler != undefined) {
                errorHandler(error);
            }
        },
        success: function (result) {
            successHandler(result);
        }
    });
};
function getSelf (url, data, successHandler, errorHandler) {
    $.ajax({
        url: url,
        data: data,
        type: 'GET',
        error: function (error) {
            alert('Network Error : ' + error);
            console.log(error);
            if (errorHandler != undefined) {
                errorHandler(error);
            }
        },
        success: function (result) {
            successHandler(result);
        }
    });
};
function returnCustomDateFromString(dateString) {
    var inputWrittenDateString = '20' + dateString;
    var pattern = /(\d{4})\.(\d{2})\.(\d{2}) (\d{2})\:(\d{2})/;
    return new Date(inputWrittenDateString.replace(pattern, '$1-$2-$3T$4:$5:00+0900'));
}
function returnKoreaCurrentDate(){
    var tempDate = new Date();
    var offset = tempDate.getTimezoneOffset();
    var now = new Date(tempDate.getTime() + 32400000 + (offset * 60000));
    return now;
}
function returnKoreaDate(date){
    
    var tempDate = date
    var offset = tempDate.getTimezoneOffset();
    var now = new Date(tempDate.getTime() + 32400000 + (offset * 60000));
    console.log(date);
    console.log(offset);
    console.log(now);
    return now;
}
function returnKoreaCurrentDateToCustomString(){
    var now = returnKoreaCurrentDate();
    var returnString = now.getUTCFullYear().toString().substring(2) + '.' + ((now.getUTCMonth() + 1) < 10 ? '0' + (now.getUTCMonth() + 1) : now.getUTCMonth() ) + '.' + (now.getUTCDate() < 10 ? '0' + now.getUTCDate() : now.getUTCDate() ) + ' ' + (now.getUTCHours() < 10 ? '0' + now.getUTCHours() : now.getUTCHours() ) + ':' + (now.getUTCMinutes() < 10 ? '0' + now.getUTCMinutes() : now.getUTCMinutes() );
    return returnString;
}
function readURL(input,targetSelector,defaultImage) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();

        reader.onload = function (e) {
            $(targetSelector).attr('src', e.target.result);
        }

        reader.readAsDataURL(input.files[0]);
    }else{
        $(targetSelector).attr('src',defaultImage);
    }
}
function getParameter(param) {
    var returnValue;
    var url = location.href;
    var parameters = (url.slice(url.indexOf('?') + 1, url.length)).split('&');
    for (var i = 0; i < parameters.length; i++) {
        var varName = parameters[i].split('=')[0];
        if (varName.toUpperCase() == param.toUpperCase()) {
            returnValue = parameters[i].split('=')[1];
            return decodeURIComponent(returnValue);
        }
    }
};

// $('form#change-my-password').on('submit', function () {
//     if ($('#current-password-input').val().trim() == '' || $('#new-password-input').val().trim() == '' || $('#confirm-new-password-input').val().trim() == '') {
//         alert('전부 입력해주세요.');
//         return false;
//     }
//     if ($('#new-password-input').val() != $('#confirm-new-password-input').val()) {
//         alert('비밀번호랑 확인이랑 다릅니다.');
//         return false;
//     }

//     return true;
// });
