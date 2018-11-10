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
        this.listClickAction = this.listClickAction.bind(this);
        this.volumeClickAction = this.volumeClickAction.bind(this);
        this.backgroundOnClickAction = this.backgroundOnClickAction.bind(this);
        this.inputFormOnKeyPress = this.inputFormOnKeyPress.bind(this);
        this.volumePostAction = this.volumePostAction.bind(this);

        this.addUrlModalRef = React.createRef();
        this.addUrlInputRef = React.createRef();
        this.volumnSpanRef = React.createRef();

        this.state = {
            isVolumeEditable : false,
            inputText: {},
            data: {},
            select: {
            }
        };
    }
    componentDidMount() {
        this.loadDataFunc();
        document.addEventListener('click', this.backgroundOnClickAction);
    }
    componentWillUnmount() {
        document.removeEventListener('click', this.backgroundOnClickAction);
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
    inputFormOnKeyPress(e){
        if (e.target.name == "volume" && e.key === 'Enter') {
            this.volumePostAction();
        }
    }
    initAllState() {
        this.setState({
        });
    }
    playButtonAction(url) {
        startLoading();
        let jsonData = {}
        let currentUrl = this.state.data["play-status"]["current_url"];
        if (url){
            jsonData["url"] = url
            currentUrl = url
        }
        const self = this;
        postSelf(jsonData, '/api/play').then(data => {
            finLoading();
            self.setState({
                data: {
                    ...self.state.data,
                    "is-playing": true,
                    "play-status": {
                        ...self.state.data["play-status"],
                        "current_url" : currentUrl
                    }
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
        this.addUrlInputRef.current.focus();
        
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
            finLoading();
            self.addUrlModalRef.current.hideModal();
            self.loadDataFunc();
        }).catch(code => {
            finLoading();
        });
    }
    listClickAction(url){
        if (confirm("이 곡을 재생할까요?")){
            this.playButtonAction(url);
        }
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
    volumeClickAction(){
        if (!this.state.isVolumeEditable){
            this.setState({
                isVolumeEditable : true,
                inputText : {
                    ...this.state.inputText,
                    volume : this.state.data["play-status"]["volume"] * 10
                }
            })
        }
    }
    backgroundOnClickAction(e){
        const currentTarget = e.target;
        if (!this.volumnSpanRef.current.contains(currentTarget)){
            if (this.state.isVolumeEditable){
                this.setState({
                    isVolumeEditable : false
                })
            }
        }
    }
    volumePostAction(){
        const self = this;
        startLoading();
        let jsonData = {
            "vol" : this.state.inputText.volume / 10
        }
        postSelf(jsonData,"/api/set-vol").then(data =>{
            finLoading();
            self.setState({
                isVolumeEditable : false,
                data:{
                    ...self.state.data,
                    ["play-status"] : {
                        ...self.state.data["play-status"],
                        volume : this.state.inputText.volume / 10
                    }
                }
            })
        }).catch(code =>{
            finLoading();
        });
    }
    render() {
        const { inputText, data } = this.state;
        return (
            <Fragment onClick={this.backgroundOnClickAction}>
                <div class="row attendance-button-row">
                    {
                        data["is-playing"] ? (<button type="button" class="btn btn-danger btn-lg play-controll" onClick={this.stopButtonAction}><i class="fa fa-stop"/></button>) : (<button type="button" class="btn btn-success btn-lg play-controll" onClick={this.playButtonAction.bind(this,null)}><i class="fa fa-play"/></button>)
                    }
                    <span ref={this.volumnSpanRef} className="active clickable" onClick={this.volumeClickAction}>volume : {this.state.isVolumeEditable ? (<input id="volume" type="text" name="volume" value={this.state.inputText.volume} onChange={this.onInputFormTextChange} onKeyPress={this.inputFormOnKeyPress}/>) : data["play-status"] ? data["play-status"]["volume"] * 10 : ""} </span>
                </div>
                <div class="row music-list-row">
                    <div class="col-lg-6">
                        <div class="panel panel-default">
                            <div class="panel-heading">
                                <i class="fa fa-user fa-fw"></i> 음악 목록
                                <div class="pull-right">
                                    <button type="button" class="btn btn-info btn-xs" onClick={this.addButtonAction}><i class="fa fa-plus"/></button>
                                </div>
                            </div>
                            <div class="panel-body">
                                <div class="list-group">
                                    {
                                        unWrapToArray(data["url-list"]).map((v, i) => {
                                            return (
                                                <div class={`list-group-item url-list clickable ${v["url"] == data["play-status"]["current_url"] ? "active" : ""}`} onClick={this.listClickAction.bind(this,v["url"])}>
                                                    <span className="title">{v["title"]}</span>
                                                    <span class="pull-right text-muted small time"><em>{secondToString(v['seconds'])}</em></span>
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
                            <input ref={this.addUrlInputRef} type="text" class="form-control" value={inputText.addUrl} onChange={this.onInputFormTextChange} name="addUrl" />
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