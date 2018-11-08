import React, { Component, Fragment } from "react";
import {UseConsume }  from './MainProvider.js'

import Modal from './templates/Modal.js';

import Select2 from 'react-select2-wrapper';
import FullCalendar from 'fullcalendar-reactwrapper';
import queryString from'query-string';

import 'react-select2-wrapper/css/select2.css';
import 'fullcalendar-reactwrapper/dist/css/fullcalendar.min.css';
import '../public/css/dash.css';


import {
    getSelf,
    startLoading,
    finLoading,
    unWrapToArray,
    getSelectedValuesFromSelect2,
    unWrapToString,
    returnKoreaCurrentDate,
    postSelf,
    getRole
} from './utils/shared_functions.js';


class DashPage extends Component {
    constructor(props, context) {
        super(props);
        this.componentDidMount = this.componentDidMount.bind(this);
        this.loadDataFunc = this.loadDataFunc.bind(this);
        this.onInputFormTextChange = this.onInputFormTextChange.bind(this);
        this.initAllState = this.initAllState.bind(this);
        this.attendanceButtonAction = this.attendanceButtonAction.bind(this);
        this.selectOnChange = this.selectOnChange.bind(this);
        this.delegateAttendPost = this.delegateAttendPost.bind(this);
        this.fcDayClickAction = this.fcDayClickAction.bind(this);
        this.fcMoveMonth = this.fcMoveMonth.bind(this);
        this.fcEventClickAction = this.fcEventClickAction.bind(this);
        this.deleteRestPostButtonAction = this.deleteRestPostButtonAction.bind(this);
        this.addRestPostButtonAction = this.addRestPostButtonAction.bind(this);

        this.delegateAttenModalRef = React.createRef();
        this.delegateAttencePersonListSelectRef = React.createRef();
        this.restTypeListSelectRef = React.createRef();
        this.addRestModalRef = React.createRef();
        this.eventDetailModalRef = React.createRef();

        this.state = {
            inputText: {},
            data: {},
            select: {
            },
            selectedDate: "",
            selectedEvent: {
                allDay: false,
                color: "",
                description: "",
                end: null,
                id: 0,
                "is-mine": false,
                start: null,
                "time-range": "[00:00:00,00:00:00]",
                title: ""
            },
        };
        this.selected = {};
        this.deleteButtonTitles = {
            true: '취소',
            false: '삭제하기'
        }
        this.deleteMode = false;
        const queryParams = queryString.parse(location.search);
        if (queryParams["m"]){
            this.currentDate = new Date(queryParams["y"], queryParams["m"] - 1, 1);
        }else{
            this.currentDate = returnKoreaCurrentDate();
        }
        this.props.consume.actions.loadDataFunc = this.loadDataFunc;
    }
    componentDidMount() {
        // this.loadDataFunc();
    }
    loadDataFunc(callBack) {
        const self = this;
        startLoading();
        const queryParams = queryString.parse(location.search);
        getSelf(`/api/dash${queryParams['m'] ? `?m=${queryParams['m']}&y=${queryParams['y']}` : "" }`).then(data => {
            self.setState({
                data: data["data"]
            })
            if (callBack){
                callBack();
            }
            self.props.consume.actions.setValue("roleArr",getRole());
            finLoading();
        }).catch(code => {
            finLoading();
            switch(code){
                case 403:
                alert(`권한이 없습니다`);
                break;
                default:
                alert(`Error : ${code}`)
                break;
            }
            
        });
    }
    onInputFormTextChange(e) {
        const name = e.target.name
        if (name) {
            this.setState({
                inputText: {
                    ...this.state.inputText,
                    [name]: e.target.value
                }
            });
        }
    }
    initAllState() {
        this.setState({
        });
    }
    attendanceButtonAction() {
        let jsonData = {}
        postSelf(jsonData, '/api/play').then(data => {
        }).catch(code => {
        });
    }
    stopButtonAction(){
        let jsonData = {}
        postSelf(jsonData, '/api/stop').then(data => {
        }).catch(code => {
        });
    }
    delegateAttendPost() {
        const self = this;
        const selected = unWrapToArray(this.selected.delegateAttencePersonList)
        if (selected.length == 0) {
            alert('요청 드릴 분을 선택해 주세요!');
            return;
        }
        startLoading();
        let formData = new FormData();
        formData.append("pid", selected[0])
        postSelfWithoutFile(formData, "/api/delegate-attend").then(data => {
            alert("요청 완료!");
            finLoading();
            self.delegateAttenModalRef.current.hideModal();
        }).catch(code => {
            finLoading();
            switch (code) {
                case 400:
                    alert("파라메터 에러!!");
                    break;
                case 402:
                    alert("DB ERROR");
                    break;
                default:
                    alert(`Error : ${code}`);
                    break;
            }
        });
    }
    selectOnChange(e) {
        const name = e.target.name;
        this.selected[name] = getSelectedValuesFromSelect2(this[`${name}SelectRef`])
        if (name == "restTypeList") {
            let selectedType = null;
            if (this.selected[name]) {
                if (this.selected[name].length != 0) {
                    selectedType = this.selected[name][0];
                }
            }
            if (selectedType && this.state.selectedRestType != selectedType) {
                this.setState({
                    selectedRestType: selectedType
                });
            }

        }
    }
    fcDayClickAction(date, jsEvent, view) {
        this.selected.restTypeList = []
        this.setState({
            selectedDate: moment(date.format('YYYY-MM-DD'), 'YYYY-MM-DD').format('YY.MM.DD'),
            selectedRestType: null,
            inputText : {}
        })
        this.addRestModalRef.current.showModal();
    }
    fcMoveMonth(type) {
        const self = this;
        if (type == 0) {
            if (this.currentDate.getMonth() == 0) {
                this.currentDate = new Date(this.currentDate.getFullYear() - 1, 11, 1);
            } else {
                this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1, 1);
            }
        } else {
            if (this.currentDate.getMonth() == 11) {
                this.currentDate = new Date(this.currentDate.getFullYear() + 1, 0, 1);
            } else {
                this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 1);
            }
        }
        history.replaceState(null,null,`/dash?m=${this.currentDate.getMonth() + 1}&y=${this.currentDate.getFullYear()}`)
        startLoading();
        getSelf('/api/get-rest-list', {
            'm': this.currentDate.getMonth() + 1,
            'y': this.currentDate.getFullYear()
        }).then(data => {
            self.setState({
                data: {
                    ...this.state.data,
                    "date-data": data
                }
            })
            finLoading();
        }).catch(code => {
            finLoading();
        });
    }
    deleteRestPostButtonAction() {
        if (confirm('정말로 삭제하시겠습니까?')) {
            const self = this;
            let formData = new FormData();
            formData.append("rid", this.state.selectedEvent.id);
            startLoading();
            postSelfWithoutFile(formData, "/api/delete-rest").then(data => {
                finLoading();
                alert('삭제 완료');
                self.setState({
                    data: {
                        ...self.state.data,
                        "date-data": self.state.data["date-data"].filter(v => {
                            return v.id != self.state.selectedEvent.id;
                        })
                    }
                });
                self.eventDetailModalRef.current.hideModal();
            }).catch(code => {
                finLoading();
                switch (code) {
                    case 400:
                        alert('파라메터 에러');
                        break;
                    case 402:
                        alert('디비에러');
                        break
                    case 403:
                        alert('권한이 없습니다.');
                        break;
                    default:
                        alert(`Error : ${code}`)
                        break
                }
            });
        }
    }
    fcEventClickAction(calEvent, jsEvent, view) {
        if (this.deleteMode) {
            if (calEvent['is-mine']) {
                // deleteRestPostButtonAction(calEvent.id);
            } else {
                // alert('권한이 없습니다.');
            }
        } else {
            this.setState({
                selectedEvent: calEvent
            })
            this.eventDetailModalRef.current.showModal();
        }
    }
    addRestPostButtonAction() {
        const { selectedRestType, inputText } = this.state;
        if (selectedRestType == null) {
            alert('종류를 선택 해 주세요');
            return;
        }
        if (selectedRestType == 2 || selectedRestType == 5) {
            if (unWrapToString(inputText.addRestTimeStart) == "" || unWrapToString(inputText.addRestTimeEnd) == "") {
                alert('시작시간, 종료시간을 전부 입력해주세요');
                return;
            }
            if (
                !/^([01][0-9]|2[0-3]):([0-5][0-9])$/.test(unWrapToString(inputText.addRestTimeStart)) ||
                !/^([01][0-9]|2[0-3]):([0-5][0-9])$/.test(unWrapToString(inputText.addRestTimeEnd))
            ) {
                alert('시간 형식이 올바르지 않습니다.\n(00:00)');
                return;
            }
            if (
                (unWrapToString(inputText.addRestTimeStart).split(':')[0] > unWrapToString(inputText.addRestTimeEnd).split(':')[0]) ||
                (unWrapToString(inputText.addRestTimeStart) == unWrapToString(inputText.addRestTimeEnd))
            ) {
                alert('시작시간, 종료시간이 올바르지 않습니다.');
                return;
            }
        }
        if (unWrapToString(this.state.selectedDate) == '') {
            alert('날짜를 입력해주세요!');
            return;
        }
        if (
            !/^\d{2}\.(0[1-9]|1[012])\.(0[1-9]|[12][0-9]|3[0-1])$/.test(unWrapToString(this.state.selectedDate)) ||
            (
                unWrapToString(inputText.addRestDateEnd) != '' &&
                unWrapToString(inputText.addRestDateEnd) != undefined &&
                !/^\d{2}\.(0[1-9]|1[012])\.(0[1-9]|[12][0-9]|3[0-1])$/.test(unWrapToString(inputText.addRestDateEnd))
            )
        ) {
            alert('날짜형식이 올바르지 않습니다.');
            return;
        }
        startLoading();
        let formData = new FormData();
        formData.append("date",unWrapToString(this.state.selectedDate));
        if (unWrapToString(inputText.addRestDateEnd) != ""){
            formData.append("end-date",unWrapToString(inputText.addRestDateEnd));
        }
        if (selectedRestType == 2 || selectedRestType == 5) {
            formData.append("time-range",`[${unWrapToString(inputText.addRestTimeStart)},${unWrapToString(inputText.addRestTimeEnd)}]`);
        }
        if (unWrapToString(inputText.addRestEtc) != ""){
            formData.append("etc",unWrapToString(inputText.addRestEtc));
        }
        formData.append("type",selectedRestType);

        const self = this;
        postSelfWithoutFile(formData, "/api/add-rest").then(data => {
            finLoading();
            alert('등록되었습니다.');
            self.addRestModalRef.current.hideModal();
            self.loadDataFunc();
        }).catch(code => {
            finLoading();
            switch (code) {
                case 400:
                    alert('파라메터 에러');
                    break;
                case 402:
                    alert('디비에러');
                    break;
                default:
                    alert(`Error : ${code}`);
            }
        });


    }
    render() {
        const { inputText, data, selectedEvent } = this.state;
        let restPeapleList = unWrapToArray(data["rest"]).map(v => {
            return (
                <div class="list-group-item">
                    {v['nick-name']}님
                    <span class="pull-right text-muted small"><em>{v['type']}</em></span>
                </div>
            )
        })
        let currentPeapleList = unWrapToArray(data["attendance"]).map(v => {
            return (
                <div class="list-group-item">
                    {`${v['is-attendance'] ? "출근 " : "퇴근 "} ${v['nick-name']}님`}
                    <span class="pull-right text-muted small"><em>{v['time']}</em></span>
                </div>
            )
        })
        let notYetComePeapleArr = unWrapToArray(data['all-person']);
        var length = notYetComePeapleArr.length;
        for (let i = 0; i < length; i++) {
            var flag = false;
            for (let j = 0; j < unWrapToArray(data['rest']).length; j++) {
                if (notYetComePeapleArr[i]['nick-name'] == data['rest'][j]['nick-name']) {
                    notYetComePeapleArr.splice(i, 1);
                    length = length - 1;
                    i = i - 1;
                    flag = true;
                    break;
                }
            }
            if (flag) {
                continue;
            }
            for (let j = 0; j < unWrapToArray(data['attendance']).length; j++) {
                if (notYetComePeapleArr[i]['nick-name'] == data['attendance'][j]['nick-name']) {
                    notYetComePeapleArr.splice(i, 1);
                    length = length - 1;
                    i = i - 1;
                    break;
                }
            }
        }
        let notYetComePeapleList = notYetComePeapleArr.map(v => {
            return (
                <div class="list-group-item">
                    {v['nick-name']}님
                </div>
            )
        });
        return (
            <Fragment>
                <div class="row attendance-button-row">
                    <div class="col-lg-3 col-md-6">
                        {
                            this.state.data["is-attendance"]
                                ? (<input type="button" class="btn btn-success btn-lg btn-block" value="퇴근하기" onClick={this.attendanceButtonAction} />)
                                : (<input type="button" class="btn btn-primary btn-lg btn-block" value="출근하기" onClick={this.attendanceButtonAction} />)

                        }
                    </div>
                </div>
                <div class="row attendance-button-row">
                    <div class="col-lg-3 col-md-6">
                    <input type="button" class="btn btn-success btn-lg btn-block" value="종료하기" onClick={this.stopButtonAction} />
                    </div>
                </div>
                <div class="row status-row">
                    <div class="col-lg-4">
                        <div class="panel panel-default">
                            <div class="panel-heading">
                                <i class="fa fa-user fa-fw"></i> 오늘 출근 안하는 분들
                            </div>
                            <div class="panel-body">
                                <div class="list-group">
                                    {restPeapleList}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-lg-4">
                        <div class="panel panel-default">
                            <div class="panel-heading">
                                <i class="fa fa-user fa-fw"></i> 출근 기록
                            </div>
                            <div class="panel-body">
                                <div class="list-group">
                                    {currentPeapleList}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-lg-4">
                        <div class="panel panel-default">
                            <div class="panel-heading">
                                <i class="fa fa-user fa-fw"></i> 곧 오실 분들
                            </div>
                            <div class="panel-body">
                                <div class="list-group">
                                    {notYetComePeapleList}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Fragment>
        );
    }
}


export default UseConsume(DashPage);