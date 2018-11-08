import React, { Component, Fragment } from "react";
import {UseConsume }  from './MainProvider.js'

import Modal from './templates/Modal.js';

import Select2 from 'react-select2-wrapper';
import queryString from'query-string';

import BreadCrumbs from "./templates/BreadCrumbs.js";
import Card from "./templates/Card.js";

import 'react-select2-wrapper/css/select2.css';
import 'fullcalendar-reactwrapper/dist/css/fullcalendar.min.css';
import '../public/css/dash.css';


import {
    getSelf,
    startLoading,
    finLoading,
    unWrapToArray,
    postSelfWithoutFile
} from './utils/shared_functions.js';


class MessagesPage extends Component {
    constructor(props, context) {
        super(props);
        this.componentDidMount = this.componentDidMount.bind(this);
        this.loadDataFunc = this.loadDataFunc.bind(this);
        this.onInputFormTextChange = this.onInputFormTextChange.bind(this);
        this.initAllState = this.initAllState.bind(this);

        this.state = {
            inputText: {},
            data: []
        };
        this.selected = {};
        this.props.consume.actions.loadDataFunc = this.loadDataFunc;
    }
    componentDidMount() {
        this.loadDataFunc();
    }
    loadDataFunc(callBack) {
        const self = this;
        startLoading();
        const queryParams = queryString.parse(location.search);
        getSelf(`/api/messages`).then(data => {
            self.setState({
                data: data["data"]
            })
            if (callBack){
                callBack();
            }
            finLoading();
        }).catch(code => {
            finLoading();
            alert(`Error : ${code}`)
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
    attendButtonAction(did){
        startLoading();
        let formData = new FormData();
        formData.append("did",did);
        const self = this;
        postSelfWithoutFile(formData,"/api/process-delegated-attendance").then(data =>{
            finLoading();
            alert('처리 완료');
            self.loadDataFunc();
        }).catch(code =>{
            finLoading();
            switch(code){
                case 400:
                    alert('파라메터 에러!');
                    break;
                case 401:
                    alert('이미 퇴근상태입니다');
                    break;
                case 402:
                    alert('DB ERROR');
                    break;
                case 403:
                    alert('권한이 없습니다');
                    break;
                case 405:
                    alert('퇴근 처리는 사무실에서만 가능합니다');
                    break;
                default:
                alert(`Error : ${code}`);
            }
        });
    }
    
    
    render() {
        const { inputText, data, selectedEvent } = this.state;
        return (
            <Fragment>
                <BreadCrumbs title="요청목록"/>
                <div className="row">
                    <div className="col-lg-12">
                        <Card title = "목록">
                        <table width="100%" class="table table-striped table-bordered table-hover" id="request-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>요청 일시</th>
                                    <th>종류</th>
                                    <th>요청자</th>
                                    <th>처리 확인</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    unWrapToArray(data).map( v => {
                                        return (
                                            <tr>
                                            <td>{v["id-num"]}</td>
                                            <td>{v["date-time"]}</td>
                                            <td>{v["type"] == 0 ? "대리 퇴근" : ""}</td>
                                            <td>{v["requester"]}</td>
                                            <td>{v["status"] ? "완료" : (<button class="btn btn-xs btn-primary" onClick={this.attendButtonAction.bind(this, v["id-num"])}>처리하기</button>)}</td>
                                        </tr>
                                        );
                                    })
                                }
                            </tbody>
                        </table>
                        </Card> 
                    </div>
                </div>
            </Fragment>
        );
    }
}


export default UseConsume(MessagesPage);