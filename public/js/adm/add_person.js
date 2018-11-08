$(document).ready(function() {
    $('#department-select').select2();
    $('#priv-select').select2();

    $('form#addPerson').on('submit',function(){
        if ($('input#name').val().trim() == ''){
            alert('이름을 입력해주세요.');
            return false;    
        }
        if ($('input#id').val().trim() == ''){
            alert('아이디를 입력해주세요.');
            return false;    
        }
        if ($('input#nick-name').val().trim() == ''){
            alert('별명을 입력해주세요.');
            return false;    
        }
        if ($('input#password').val().trim() == ''){
            alert('비밀번호를 입력해주세요.');
            return false;    
        }
        if ($('input#join-date').val().trim() == ''){
            alert('입사일자를 입력해주세요.');
            return false;    
        }
        if (!/^\d{2}\.(0[1-9]|1[012])\.(0[1-9]|[12][0-9]|3[0-1])$/.test($('input#join-date').val().trim())){
            alert('입사일자형식이 틀렸습니다.');
            return false;    
        }
    });
});