import React, { Component, Fragment } from "react";
import { UseConsume }  from './MainProvider.js'

import 'react-select2-wrapper/css/select2.css';

import {
    getSelf,
    camelToBarCase,
    isLogin,
    getSelectedCompanyFromCookie,
    postSelfWithoutFile,
    startLoading,
    finLoading
} from './utils/shared_functions.js';


class LoginPage extends Component {
    constructor(props, context) {
        super(props);
        this.componentDidMount = this.componentDidMount.bind(this);
        this.componentWillUnmount = this.componentWillUnmount.bind(this);
        this.loadDataFunc = this.loadDataFunc.bind(this);
        this.onInputFormTextChange = this.onInputFormTextChange.bind(this);
        this.passOnKeyPress = this.passOnKeyPress.bind(this);
        this.submitButtonAction = this.submitButtonAction.bind(this);
        this.initAllState = this.initAllState.bind(this);
        this.state = {
            inputText: {}
        };
    }
    componentDidMount() {
        this.checkIsLogin();
        this.initAllState();
        this.props.setIsLoginPage(true);
    }
    componentWillUnmount() {
        this.props.setIsLoginPage(false);
    }
    loadDataFunc() {
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
    passOnKeyPress(e) {
        if (e.target.name == "pass" && e.key === 'Enter') {
            this.submitButtonAction();
        }
    }
    submitButtonAction(consume) {
        startLoading();
        const self = this;
        const { inputText } = this.state;

        let formData = new FormData();
        for (const key in inputText) {
            formData.append(camelToBarCase(key), inputText[key].trim());
        }
        postSelfWithoutFile(formData, '/api/login').then(data => {
            finLoading();
            self.props.consume.actions.setValue("nickName",data["nick-name"]);
            self.props.consume.actions.setValue("companyArr",data["company-arr"]);
            self.props.consume.actions.setValue("selectedCompany",getSelectedCompanyFromCookie());
            self.props.history.replace('/dash');
        }).catch(code => {
            finLoading();
            switch (code) {
                case 404:
                    alert('없는 아이디입니다.');
                    break;
                case 403:
                    alert('비밀번호가 틀렸습니다.');
                    break;
                default:
                    alert(`error (${code})`);
                    break;
            }
        });
    }
    initAllState() {
        this.setState({
            inputText: {
                id: "",
                pass: ""
            }
        });
    }
    checkIsLogin() {
        if (isLogin()) {
            if (!this.props.consume.state.nickName){
                const self = this;
                const formData = new FormData();
                startLoading();
                postSelfWithoutFile(formData,'/api/auto-login').then(data =>{
                    finLoading();
                    self.props.consume.actions.setValue("nickName",data["nick-name"]);
                    self.props.consume.actions.setValue("companyArr",data["company-arr"]);
                    self.props.consume.actions.setValue("selectedCompany",getSelectedCompanyFromCookie());
                    self.props.history.replace('/dash');
                }).catch(code =>{
                    finLoading();
                });
            }
        }
    }

    render() {
        const { inputText } = this.state;
        return (
            <Fragment>
                <div class="row">
                    <div class="col-md-4 col-md-offset-4">
                        <div class="login-panel panel panel-default">
                            <div class="panel-heading">
                                <h3 class="panel-title">로그인 해주세요</h3>
                            </div>
                            <div class="panel-body">
                                <form role="form" id="login-form" class="form-vertical" onSubmit={this.submitButtonAction}>
                                    <fieldset>
                                        <div class="form-group">
                                            <input type="text" class="form-control" placeholder="ID" name="id" value={inputText.id} onChange={this.onInputFormTextChange} />
                                        </div>
                                        <div class="form-group">
                                            <input type="password" class="form-control" placeholder="Password" name="pass" value={inputText.pass} onChange={this.onInputFormTextChange} onKeyPress={this.passOnKeyPress} />
                                        </div>
                                        <input type="button" class="btn btn-primary btn-lg btn-block" onClick={this.submitButtonAction} value="Login" />
                                    </fieldset>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </Fragment>
        );
    }
}

export default UseConsume(LoginPage);