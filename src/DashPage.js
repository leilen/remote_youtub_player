import React, { Component, Fragment } from "react";
import { UseConsume } from './MainProvider.js'

import Modal from './templates/Modal.js';

import Select2 from 'react-select2-wrapper';
import socketIOClient from 'socket.io-client'

import 'react-select2-wrapper/css/select2.css';
import '../public/css/dash.css';


import {
    getSelf,
    startLoading,
    finLoading,
    unWrapToArray,
    getSelectedValuesFromSelect2,
    unWrapToString,
    secondToString
} from './utils/shared_functions.js';


class DashPage extends Component {
    constructor(props, context) {
        super(props);
        this.componentDidMount = this.componentDidMount.bind(this);
        this.componentDidUpdate = this.componentDidUpdate.bind(this);
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
        this.editListButtonAction = this.editListButtonAction.bind(this);
        this.onSocketPlay = this.onSocketPlay.bind(this);
        this.onSocketVolume = this.onSocketVolume.bind(this);
        this.onSocketAddList = this.onSocketAddList.bind(this);

        this.addUrlModalRef = React.createRef();
        this.addUrlInputRef = React.createRef();
        this.volumeSpanRef = React.createRef();
        this.volumeInputRef = React.createRef();

        this.isVolumeInputFirstFocus = false;

        this.state = {
            isVolumeEditable : false,
            isListEditable : false,
            inputText: {},
            data: {},
            select: {
            }
        };

        this.socket = socketIOClient()
        this.socket.on("play",this.onSocketPlay);
        this.socket.on("volume",this.onSocketVolume);
        this.socket.on("addList",this.onSocketAddList);


    }
    componentDidMount() {
        this.loadDataFunc();
        document.addEventListener('click', this.backgroundOnClickAction);
    }
    componentWillUnmount() {
        document.removeEventListener('click', this.backgroundOnClickAction);
    }
    componentDidUpdate(){
        if (this.state.isVolumeEditable){
            if (this.isVolumeInputFirstFocus){
                this.isVolumeInputFirstFocus = false;
                this.volumeInputRef.current.select();
            }
        }
      }
    loadDataFunc(callBack) {
        const self = this;
        startLoading();
        getSelf(`/api/dash`).then(data => {
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
        let jsonData = {isPlay : true}
        if (url){
            jsonData["url"] = url
        }
        this.socket.emit('play', jsonData);
    }
    stopButtonAction() {
        startLoading();
        let jsonData = {isPlay : false}
        this.socket.emit('play', jsonData);
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
            "isAdd" : true,
            "url" : this.state.inputText.addUrl
        }
        this.socket.emit("addList",jsonData);
        this.addUrlModalRef.current.hideModal();
    }
    listClickAction(url,e){
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
            this.isVolumeInputFirstFocus = true;
        }
    }
    backgroundOnClickAction(e){
        const currentTarget = e.target;
        if (!this.volumeSpanRef.current.contains(currentTarget)){
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
        const volumeFloat = parseFloat(this.state.inputText.volume);
        if (!(volumeFloat && volumeFloat >= 0 && volumeFloat <= 10)){
            finLoading();
            alert("볼륨 값은 0 ~ 10만 가능합니다");
            this.setState({
                isVolumeEditable : false
            })
            return;
        }
        let jsonData = {
            "vol" : this.state.inputText.volume / 10
        }
        this.socket.emit('volume', jsonData);
    }
    editListButtonAction(){
        this.setState({
            isListEditable : !this.state.isListEditable
        })
    }
    deleteButtonAction(url,e){
        e.stopPropagation();
        if (confirm("이 곡을 삭제할까요?")){
            startLoading();

            let jsonData = {
                "isAdd" : false,
                "url" : url
            }
            this.socket.emit("addList",jsonData);

        }
    }
    onSocketPlay(data){
        finLoading();
        let tempUrlList = this.state.data["url-list"];
        for (let i in tempUrlList){
            if (tempUrlList[i]["url"] == data["list"]["url"]){
                tempUrlList[i] = data["list"]
                break;
            }
        }
        this.setState({
            data : {
                ...this.state.data,
                "is-playing" : data["isPlay"],
                "play-status" : {
                    ...this.state.data["play-status"],
                    "current_url" : data["list"]["url"]
                },
                "url-list" : tempUrlList
            }
        });
    }
    onSocketVolume(data){
        finLoading();
        this.setState({
            isVolumeEditable : false,
            data:{
                ...this.state.data,
                ["play-status"] : {
                    ...this.state.data["play-status"],
                    volume : data["vol"]
                }
            }
        })
    }
    onSocketAddList(data){
        finLoading();
        let newList = [];
        if (data["isAdd"]){
            if (data["isRedendunted"]){
                newList = this.state.data["url-list"].filter(v => (v["url"] != data["list"]["url"])).concat([data["list"]]);
            }else{
                newList = this.state.data["url-list"].concat([data["list"]]);
            }
        }else{
            newList = this.state.data["url-list"].filter(v =>{
                return v["url"] != data["list"]["url"]
            });
        }
        this.setState({
            data:{
                ...this.state.data,
                "url-list" : newList
            }
        })
    }
    render() {
        const { inputText, data } = this.state;
        return (
            <Fragment onClick={this.backgroundOnClickAction}>
                <div class="row attendance-button-row">
                    {
                        data["is-playing"] ? (<button type="button" class="btn btn-danger btn-lg play-controll" onClick={this.stopButtonAction}><i class="fa fa-stop"/></button>) : (<button type="button" class="btn btn-success btn-lg play-controll" onClick={this.playButtonAction.bind(this,null)}><i class="fa fa-play"/></button>)
                    }
                    <span ref={this.volumeSpanRef} className="active clickable" onClick={this.volumeClickAction}>volume : {this.state.isVolumeEditable ? (<input ref={this.volumeInputRef} id="volume" type="text" name="volume" value={this.state.inputText.volume} onChange={this.onInputFormTextChange} onKeyPress={this.inputFormOnKeyPress}/>) : data["play-status"] ? data["play-status"]["volume"] * 10 : ""} </span>
                </div>
                <div class="row music-list-row">
                    <div class="col-lg-6">
                        <div class="panel panel-default">
                            <div class="panel-heading">
                                <i class="fa fa-user fa-fw"></i> 음악 목록
                                <div class="pull-right">
                                    {   
                                        !this.state.isListEditable &&
                                        (<button type="button" class="btn btn-info btn-xs" onClick={this.addButtonAction}><i class="fa fa-plus"/></button>)
                                    }
                                    {   this.state.isListEditable ?
                                        (<button type="button" class="btn btn-success btn-xs" onClick={this.editListButtonAction}>완료</button>) :
                                        (<button type="button" class="btn btn-warning btn-xs" onClick={this.editListButtonAction}>편집</button>)
                                    }
                                </div>
                            </div>
                            <div class="panel-body">
                                <div class="list-group">
                                    {
                                        unWrapToArray(data["url-list"]).map((v, i) => {
                                            return (
                                                <div class={`list-group-item url-list clickable ${v["url"] == data["play-status"]["current_url"] ? "active" : ""}`} onClick={this.listClickAction.bind(this,v["url"])}>
                                                    <span className="title">{v["title"]}</span>
                                                    {   
                                                        this.state.isListEditable ?
                                                        (<button type="button" class="btn btn-danger btn-xs" onClick={this.deleteButtonAction.bind(this,v["url"])}><i class="fa fa-remove"/></button>) :
                                                        (<span class="pull-right text-muted small time"><em>{secondToString(v['seconds'])}</em></span>)
                                                    }
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