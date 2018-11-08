import React, { Component, Fragment } from "react";
import { UseConsume } from './MainProvider.js'

import Modal from './templates/Modal.js';

import Select2 from 'react-select2-wrapper';
import FullCalendar from 'fullcalendar-reactwrapper';
import queryString from 'query-string';

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
    postSelf,
    secondToString
} from './utils/shared_functions.js';


class DashPage extends Component {
    constructor(props, context) {
        super(props);
        this.componentDidMount = this.componentDidMount.bind(this);
        this.loadDataFunc = this.loadDataFunc.bind(this);
        this.onInputFormTextChange = this.onInputFormTextChange.bind(this);
        this.initAllState = this.initAllState.bind(this);
        this.playButtonAction = this.playButtonAction.bind(this);
        this.stopButtonAction = this.stopButtonAction.bind(this);
        this.selectOnChange = this.selectOnChange.bind(this);
        this.addButtonAction = this.addButtonAction.bind(this);
        this.addUrlPostButtonAction = this.addUrlPostButtonAction.bind(this);

        this.addUrlModalRef = React.createRef();

        this.state = {
            inputText: {},
            data: {},
            select: {
            }
        };
    }
    componentDidMount() {
        this.loadDataFunc();
    }
    loadDataFunc(callBack) {
        const self = this;
        startLoading();
        getSelf(`/api/dash`).then(data => {
            console.log(data);
            self.setState({
                data: data
            })
            finLoading();
        }).catch(code => {
            finLoading();
            switch (code) {
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
    playButtonAction() {
        startLoading();
        let jsonData = {}
        const self = this;
        postSelf(jsonData, '/api/play').then(data => {
            finLoading();
            self.setState({
                data: {
                    ...self.state.data,
                    "is-playing": true
                }
            })
        }).catch(code => {
            finLoading();
        });
    }
    stopButtonAction() {
        startLoading();
        let jsonData = {}
        const self = this;
        postSelf(jsonData, '/api/stop').then(data => {
            finLoading();
            self.setState({
                data: {
                    ...self.state.data,
                    "is-playing": false
                }
            })
        }).catch(code => {
            finLoading();
        });
    }
    addButtonAction() {
        this.addUrlModalRef.current.showModal();
        this.setState({
            inputText:{
                ...this.state.inputText,
                addUrl : ""
            }
        })
        
    }
    addUrlPostButtonAction(){
        if (!/^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube\.com|youtu.be))(\/(?:[\w\-]+\?v=|embed\/|v\/)?)([\w\-]+)(\S+)?$/.test(this.state.inputText.addUrl)){
            alert("YouTube URL을 입력해야됩니다.")
            return;
        }
        const self = this;
        startLoading();
        let jsonData = {
            "url" : this.state.inputText.addUrl
        }
        postSelf(jsonData, '/api/add-url').then(data => {
            self.addUrlModalRef.current.showModal();
            finLoading();
        }).catch(code => {
            finLoading();
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
        const { inputText, data } = this.state;
        return (
            <Fragment>
                <div class="row attendance-button-row">
                    <div class="col-lg-3 col-md-6">
                        {
                            data["is-playing"] ? (<input type="button" class="btn btn-danger btn-lg btn-block" value="종료하기" onClick={this.stopButtonAction} />) : (<input type="button" class="btn btn-primary btn-lg btn-block" value="재생하기" onClick={this.playButtonAction} />)
                        }
                    </div>
                    <div class="col-lg-3 col-md-6">
                        <input type="button" class="btn btn-info btn-lg btn-block" value="추가하기" onClick={this.addButtonAction} />
                    </div>
                </div>
                <div class="row music-list-row">
                    <div class="col-lg-6">
                        <div class="panel panel-default">
                            <div class="panel-heading">
                                <i class="fa fa-user fa-fw"></i> 음악 목록
                            </div>
                            <div class="panel-body">
                                <div class="list-group">
                                    {
                                        unWrapToArray(data["url-list"]).map((v, i) => {
                                            return (
                                                <div class={`list-group-item ${i == data["play-status"]["current_index"] ? "active" : ""}`}>
                                                    {v["title"]}<span class="pull-right text-muted small"><em>{secondToString(v['seconds'])}</em></span>
                                                </div>
                                            );
                                        })
                                    }
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
                <Modal
                    id="addUrlModalRef"
                    title="리스트 추가"
                    ref={this.addUrlModalRef}>
                    <div class="modal-body">
                        <div class="form-group">
                            <label>YouTube URL</label>
                            <input type="text" class="form-control" value={inputText.addUrl} onChange={this.onInputFormTextChange} name="addUrl" />
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-default" data-dismiss="modal">닫기</button>
                        <button type="button" class="btn btn-primary" onClick={this.addUrlPostButtonAction}>추가하기</button>
                    </div>
                </Modal>
            </Fragment>
        );
    }
}


export default UseConsume(DashPage);