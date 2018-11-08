var deleteButtonTitles = {
    true: '취소',
    false: '삭제하기'
}
var deleteMode = false;

function attendanceButtonAction(isAttendance) {
    var type = (isAttendance ? '출근' : '퇴근');
    var cfm = confirm('정말로 ' + type + '하시겠습니까?');
    if (!cfm) {
        return;
    }
    postSelf('/api/attendance', {
        'attendance': isAttendance ? 1 : 0
    }, function(result) {
        switch (result['code']) {
            case 200:
                alert(isAttendance ? '환영합니다!' : '고생하셨습니다!');
                var curDate = $('#calendar').fullCalendar('getDate');
                window.location.href = '/dash?y=' + curDate.year() + '&m=' + (curDate.month() + 1);

                break;
            case 400:
                alert('파라메터 에러!');
                break;
            case 401:
                alert('이미 ' + type + '했습니다!');
                break;
            case 403:
                alert('권한이 없습니다!');
                break;
            case 405:
                if(isAttendance){
                    alert('출근은 사무실에서 가능합니다!');
                }else{
                    var returnBool = confirm('퇴근은 사무실에서 가능합니다!\n다른사람에게 부탁하시겠습니까?');
                    if (returnBool){
                        getSelf('/api/get-can-attend-person-list', {}, function(result) {
                            if (result['code'] == 200) {
                                var optionString = '<option value="-1">선택해주세요</option>';
                                for (i in result['data']){
                                    result['data'][i]
                                    optionString += ('<option value=' + result['data'][i]['id-num'] + '>' + result['data'][i]['nick-name'] + '</option>');
                                }
                                $('.modal#delegateLoginModal select').html(optionString);
                                $('.modal#delegateLoginModal select').select2();
                                $('.modal#delegateLoginModal').modal();
                            } else {
                                alert('에러!!');
                            }
                        }, function(err) {
                            alert('에러!!');
                            console.log(err);
                        });
                    }
                }
                break;
            default:
                alert('알수없는 에러!');
                break;
        }
    }, function() {

    });
}
function delegateAttendPost(){
    if ($('.modal#delegateLoginModal select').val() == -1){
        alert('요청 드릴 분을 선택해 주세요!');
        return;
    }
    postSelf('/api/delegate-attend', {
        'pid' : $('.modal#delegateLoginModal select').val()
    }, function(result){
        switch(result['code']){
            case 200:
                alert("요청 완료!");
                $('.modal#delegateLoginModal').modal('hide');
                break;
            case 400:
                alert("파라메터 에러!!");
                break;
            case 402:
                alert("DB ERROR");
                break;
        }
    }, function(err){
        alert("알수 없는 에러!!")
    })
}

function addRestPostButtonAction() {
    var data = {};
    data['type'] = $("#addRestModal #rest-type-select option").index($("#addRestModal #rest-type-select option:selected"));
    if (data['type'] == 0) {
        alert('종류를 선택 해 주세요');
        return;
    }
    if ((data['type'] == 3 || data['type'] == 6) && ($('#addRestModal #time-range input#start').val() == '' || $('#addRestModal #time-range input#end').val() == '')) {
        alert('시작시간, 종료시간을 전부 입력해주세요');
        return;
    }
    if ($('#addRestModal #time-range input#start').val() != undefined && $('#addRestModal #time-range input#end').val() != undefined) {
        if (($('#addRestModal #time-range input#start').val().split(':')[0] > $('#addRestModal #time-range input#end').val().split(':')[0]) ||
            (($('#addRestModal #time-range input#start').val().split(':')[0] == $('#addRestModal #time-range input#end').val().split(':')[0]) && ($('#addRestModal #time-range input#start').val().split(':')[1] > $('#addRestModal #time-range input#end').val().split(':')[1]))
        ) {
            alert('시작시간, 종료시간이 올바르지 않습니다.');
            return;
        }
        if (!/^([01][0-9]|2[0-3]):([0-5][0-9])$/.test($('#addRestModal #time-range input#start').val()) ||
            !/^([01][0-9]|2[0-3]):([0-5][0-9])$/.test($('#addRestModal #time-range input#end').val())
        ) {
            alert('시간 형식이 올바르지 않습니다.\n(00:00)');
            return;
        }
    }
    if ($('#addRestModal #date input').val() == '') {
        alert('날짜를 입력해주세요!');
        return;
    }
    if (!/^\d{2}\.(0[1-9]|1[012])\.(0[1-9]|[12][0-9]|3[0-1])$/.test($('#addRestModal #date input').val()) ||
        ($('#addRestModal #end-date input').val() != '' && $('#addRestModal #end-date input').val() != undefined && !/^\d{2}\.(0[1-9]|1[012])\.(0[1-9]|[12][0-9]|3[0-1])$/.test($('#addRestModal #end-date input').val()))
    ) {
        alert('날짜형식이 올바르지 않습니다.');
        return;
    }
    data['date'] = $('#addRestModal #date input').val();
    if ($('#addRestModal #end-date input').val() != undefined) {
        data['end-date'] = $('#addRestModal #end-date input').val();
    }
    if ($('#addRestModal #time-range input#start').val() != undefined) {
        data['time-range'] = '[' + $('#addRestModal #time-range input#start').val() + ',' + $('#addRestModal #time-range input#end').val() + ']';
    }
    if ($('#addRestModal #etc input').val() != undefined) {
        data['etc'] = $('#addRestModal #etc input').val();
    }
    data['type'] = parseInt(data['type']) - 1;

    postSelf('/api/add-rest', data, function(result) {
        switch (result['code']) {
            case 200:
                alert('등록되었습니다.');
                // location.reload();
                var curDate = $('#calendar').fullCalendar('getDate');
                window.location.href = '/dash?y=' + curDate.year() + '&m=' + (curDate.month() + 1);
                break;
            case 400:
                alert('파라메터 에러');
                break;
            case 402:
                alert('디비에러');
                break;
        }
    }, function() {

    })
}

function deleteRestPostButtonAction(rid) {
    var returnBool = confirm('정말로 삭제하시겠습니까?');
    if (returnBool) {
        postSelf('/api/delete-rest', {
            'rid': rid
        }, function(result) {
            switch (result['code']) {
                case 200:
                    alert('삭제 완료');
                    var curDate = $('#calendar').fullCalendar('getDate');
                    window.location.href = '/dash?y=' + curDate.year() + '&m=' + (curDate.month() + 1);
                    break;
                case 400:
                    alert('파라메터 에러');
                    break;
                case 402:
                    alert('디비에러');
                    break
                case 403:
                    alert('권한이 없습니다.');
                    break;
            }
        }, function() {

        })
    }
}
$(document).ready(function() {
    $('#addRestModal').on('hide.bs.modal', function(e) {
        $("#addRestModal #rest-type-select").val("종류").attr("selected", "selected");
        $('#addRestModal .form-group#end-date').html('');
        $('#addRestModal .form-group#time-range').html('');
    });

    $('#addRestModal #rest-type-select').on('change', function() {
        switch ($("#addRestModal #rest-type-select option").index($("#addRestModal #rest-type-select option:selected"))) {
            case 0:
                $('#addRestModal .form-group#end-date').html('');
                $('#addRestModal .form-group#time-range').html('');
                break;
            case 1:
                $('#addRestModal .form-group#end-date').html('');
                $('#addRestModal .form-group#time-range').html('');
                break;
            case 2:
                $('#addRestModal .form-group#end-date').html(
                    '<label>종료 일자(하루일 경우 입력하지 말것.)</label>' +
                    '\n<input type="text" class="form-control" type="text" placeholder="17.00.00">');
                $('#addRestModal .form-group#time-range').html('');
                break;
            case 3:
                $('#addRestModal .form-group#end-date').html('');
                $('#addRestModal .form-group#time-range').html(
                    '<div>' +
                    '\n<label>시간</label>' +
                    '\n</div>' +
                    '\n<input type="text" type="text" placeholder="00:00" id="start">' +
                    '\n<label>~</label>' +
                    '\n<input type="text" type="text" placeholder="00:00" id="end">' +
                    '\n<div style="clear:both"></div>');
                break;
            case 4:
                $('#addRestModal .form-group#end-date').html('');
                $('#addRestModal .form-group#time-range').html('');
                break;
            case 5:
                $('#addRestModal .form-group#end-date').html('');
                $('#addRestModal .form-group#time-range').html('');
                break;
            case 6:
                $('#addRestModal .form-group#end-date').html(
                    '<label>종료 일자(하루일 경우 입력하지 말것.)</label>' +
                    '\n<input type="text" class="form-control" type="text" placeholder="17.00.00">');
                $('#addRestModal .form-group#time-range').html(
                    '<div>' +
                    '\n<label>시간</label>' +
                    '\n</div>' +
                    '\n<input type="text" type="text" placeholder="00:00" id="start">' +
                    '\n<label>~</label>' +
                    '\n<input type="text" type="text" placeholder="00:00" id="end">' +
                    '\n<div style="clear:both"></div>');
                break;
            case 7:
                $('#addRestModal .form-group#end-date').html(
                    '<label>종료 일자(하루일 경우 입력하지 말것.)</label>' +
                    '\n<input type="text" class="form-control" type="text" placeholder="17.00.00">');
                $('#addRestModal .form-group#time-range').html('');
                break;
        }
    });

    $('#calendar').fullCalendar({
        showNonCurrentDates: false,
        fixedWeekCount: false,
        displayEventTime:false,
        defaultDate: returnKoreaCurrentDate(),
        dayClick: function(date, jsEvent, view) {
            $('#addRestModal .form-group#date input').val(moment(date.format('YYYY-MM-DD'), 'YYYY-MM-DD').format('YY.MM.DD'));
            $('#addRestModal').modal();
        },
        customButtons: {
            deleteButton: {
                text: deleteButtonTitles[deleteMode],
                click: function() {
                    deleteMode = !deleteMode;
                    if (deleteMode) {
                        alert('일정을 클릭하면 삭제 할 수 있습니다.');
                    }
                    $('button.fc-deleteButton-button').html(deleteButtonTitles[deleteMode]);
                }
            },
            customPrev: {
                icon: 'left-single-arrow',
                click: function() {
                    getSelf('/api/get-rest-list', {
                        'm': $('#calendar').fullCalendar('getDate')._d.getMonth(),
                        'y': $('#calendar').fullCalendar('getDate')._d.getFullYear()
                    }, function(result) {
                        if (result['code'] == 200) {
                            dateData = result['data'];
                            $('#calendar').fullCalendar('removeEvents');
                            $('#calendar').fullCalendar('addEventSource', dateData);
                            $('#calendar').fullCalendar('refetchEvents');
                            $('#calendar').fullCalendar('prev');
                        } else {
                            alert('에러!!');
                        }
                    }, function(err) {
                        alert('에러!!');
                        console.log(err);
                    });
                }
            },
            customNext: {
                icon: 'right-single-arrow',
                click: function() {
                    getSelf('/api/get-rest-list', {
                        'm': $('#calendar').fullCalendar('getDate').month() + 2,
                        'y': $('#calendar').fullCalendar('getDate').year()
                    }, function(result) {
                        if (result['code'] == 200) {
                            dateData = result['data'];
                            $('#calendar').fullCalendar('removeEvents');
                            $('#calendar').fullCalendar('addEventSource', dateData);
                            $('#calendar').fullCalendar('refetchEvents');
                            $('#calendar').fullCalendar('next');
                        } else {
                            alert('에러!!');
                        }
                    }, function(err) {
                        alert('에러!!');
                        console.log(err);
                    });
                }
            }
        },
        header: {
            left: 'customPrev,customNext',
            center: 'title',
            right: ''
        },
        eventClick: function(calEvent, jsEvent, view) {
            if (deleteMode) {
                if (calEvent['is-mine']) {
                    deleteRestPostButtonAction(calEvent.id);
                } else {
                    alert('권한이 없습니다.');
                }
            } else {

                var timeRange = calEvent['time-range'];
                if (timeRange != null) {
                    timeRange = timeRange.substring(1, timeRange.length - 1);
                    $('#showEventDetail p#time-range').text(
                        timeRange.split(',')[0].slice(0, -3) +
                        ' - ' +
                        timeRange.split(',')[1].slice(0, -3)
                    );
                }else{
                    $('#showEventDetail p#time-range').text('');
                }
                if (calEvent['is-mine']){
                    $('#showEventDetail button#delete').show();
                    $('#showEventDetail button#delete').prop('disabled', false);
                    $('#showEventDetail button#delete').attr('onclick','deleteRestPostButtonAction(' + calEvent.id + ')');
                }else{
                    $('#showEventDetail button#delete').hide();
                    $('#showEventDetail button#delete').prop('disabled', true);
                }
                $('#showEventDetail .modal-title').text((calEvent.start == null ? '' : calEvent.start.format('YY.MM.DD')) + (calEvent.end == null ? '' : ' - ' + calEvent.end.format('YY.MM.DD')));
                $('#showEventDetail p#title').text(calEvent.title);
                $('#showEventDetail p#description').text(calEvent['description']);
                $('#showEventDetail').modal();
            }
        },
        events: dateData
    });
    if (getParameter('y') != undefined && getParameter('m') != undefined) {
        $('#calendar').fullCalendar('gotoDate', new Date(getParameter('y') + '-' + getParameter('m') + '-1'));
    }
});