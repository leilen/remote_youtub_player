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