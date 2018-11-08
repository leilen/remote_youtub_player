import axios from 'axios';
import jwtDecode from 'jwt-decode';
import Cookie from 'js-cookie';
// import { server_ip } from '../../config/config.json';

let roleArr = [];
let isProcessing = false;

export function isLogin() {
    return Cookie.get('lf-token') != undefined;
}
export function getRole() {
    if (Cookie.get('lf-token')){
        const decoded = jwtDecode(Cookie.get('lf-token'));
        return decoded['role'];
    }else{
        return [];
    }
}
export function checkRole(role) {
    if (roleArr.length == 0) {
        roleArr = getRole();
    }
    return (roleArr[Math.floor(role / 32)] & (1 << role % 32) || (roleArr[0] & 1)) ? true : false;
}
export function checkRoles(roles) {
    if (roleArr.length == 0) {
        roleArr = getRole();
    }
    for (let v of roles){
        if (checkRole(v)){
            return true;
        }
    }
    return false;
}

export function formDataToJSON(formData) {
    let convertedJSON = {},
        it = formData.entries(),
        n;

    while (n = it.next()) {
        if (!n || n.done) break;
        convertedJSON[n.value[0]] = n.value[1];
    }

    return convertedJSON;
}

export function postSelf(jsonData, url) {
    return new Promise(function (resolve, reject) {
        axios({
            method: 'post',
            url: url,
            data: jsonData
        }).then(response => {
            resolve(response.data);
        }).catch(error => {
            console.log(error);
            if (error.response.status == "444") {
                alert("로그인이 필요합니다");
                window.location.href = '/';
            } else {
                reject(error.response.status);
            }
        });
    });
}

export function postSelfWithFile(formData, url) {
    return new Promise(function (resolve, reject) {
        axios({
            method: 'post',
            url: url,
            data: formData,
            onUploadProgress: function (evt) {
                if (evt.lengthComputable) {
                    var percentComplete = evt.loaded / evt.total;
                    percentComplete = parseInt(percentComplete * 100);
                    $('#loading-view span#percent').text(percentComplete + '%');
                }
            }
        }).then(response => {
            resolve(response.data);
        }).catch(error => {
            console.log(error);
            if (error.response.status == "444") {
                alert("로그인이 필요합니다");
                window.location.href = '/';
            } else {
                reject(error.response.status);
            }
        });
    });
}

export function getSelf(url, params = {}) {
    return new Promise(function (resolve, reject) {
        axios.get(url, {
            params: params
        }).then(function (response) {
            resolve(response.data);
        })
            .catch(function (error) {
                console.log(error);
                if (error.response.status == "444") {
                    alert("로그인이 필요합니다");
                    window.location.href = '/';
                } else {
                    reject(error.response.status);
                }
            });
    });
}

export function postAPIWithoutFile(formData, url, wenwoToken) {
    return new Promise(function (resolve, reject) {
        axios({
            method: 'post',
            url: `${server_ip}${url}`,
            headers: {
                'wenwo-token': wenwoToken
            },
            data: formDataToJSON(formData)
        }).then(response => {
            resolve(response.data);
        }).catch(error => {
            console.log(error);
            if (error.response.status == "444") {
                alert("로그인이 필요합니다");
                window.location.href = '/';
            } else {
                reject(error.response.status);
            }
        });
    });
}

export function unWrapToString(val) {
    return (val == undefined || val == null) ? '' : val.trim();
}
export function unWrapToArray(val) {
    return (val == undefined || val == null) ? [] : val;
}

export function startLoading(flag = false) {
    $('#loading-view').removeClass('hide');
    $('#loading-view span#percent').text(flag ? '0%' : '');
    isProcessing = true;
}
export function finLoading() {
    isProcessing = false;
    $('#loading-view').addClass('hide');
}

export function checkIsProcessing() {
    return isProcessing;
}

//프로미스로 여러 이미지 파일을 dataUrl 형식으로 바꾸기
export function blobArrToDataURLPromise(blobArr) {
    return new Promise(function (resolve, reject) {
        var promiseArr = [];
        for (var i = 0; i < blobArr.length; i++) {
            promiseArr.push(blobToDataURLPromise(blobArr[i]));
        };
        Promise.all(promiseArr).then(function (dataArr) {
            resolve(dataArr);
        })
    });
}
//프로미스목록으로 여러 이미지 한번에 리사이징
export function resizeImageArrPromise(imageDataURLArr) {
    return new Promise(function (resolve, reject) {
        var promiseArr = [];
        for (var i = 0; i < imageDataURLArr.length; i++) {
            promiseArr.push(resizeImagePromise(imageDataURLArr[i]));
        };
        Promise.all(promiseArr).then(function (dataArr) {
            resolve(dataArr);
        });
    });
}
export function readURL(target, input, callback) {
    if (input.files && input.files[0]) {
        let reader = new FileReader();

        reader.onload = function (e) {
            $(target).attr('src', e.target.result);
            callback();
        }

        reader.readAsDataURL(input.files[0]);
    } else {
    }
}

export function replaceAll(str, searchStr, replaceStr) {
    return str.split(searchStr).join(replaceStr);
}

export function getSelectedValuesFromSelect2(ref){
    return [...ref.current.el[0].selectedOptions].map((v) => (v["value"]))
}
export function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

export function camelToBarCase(string) {
    let returnString = ""
    for (const v of string){
        const ascii = v.charCodeAt()
        if (65 <= ascii && ascii <= 90 ){
            returnString += `-${v.toLowerCase()}`
        }else{
            returnString += v
        }
    }
    return returnString;
}

//FormData 객체에서 모두 뽑아내 프린트
export function printFormData(formData) {
    for (var pair of formData.entries()) {
        // console.log(pair[0] + ', ' + pair[1]);
        console.log('-- ' + pair[0]+ ' --');
        console.log(pair[1]);
    }
}
export function returnKoreaCurrentDate(){
    const tempDate = new Date();
    const offset = tempDate.getTimezoneOffset();
    const now = new Date(tempDate.getTime() + 32400000 + (offset * 60000));
    return now;
}

export function getSelectedCompanyFromCookie() {
    return Cookie.get('selected-company');
}
export function setSelectedCompanyToCookie(cIdNum) {
    return Cookie.set('selected-company', cIdNum);
}