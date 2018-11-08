import React, { Component, Fragment } from "react";

import Modal from './templates/Modal.js';

import {
    postSelfWithoutFile,
    camelToBarCase
} from './utils/shared_functions.js';


class ChangePasswordModal extends Component {
    constructor(props) {
        super(props);
        this.openChangePassModal = this.openChangePassModal.bind(this);

        this.changePasswordTextOnChange = this.changePasswordTextOnChange.bind(this);
        this.changePaswordPostButtonAction = this.changePaswordPostButtonAction.bind(this);
        this.initChangePasswordText = this.initChangePasswordText.bind(this);
        this.state = {
            changePasswordText: {}
        }
        this.changePassModalRef = React.createRef();
        this.changePassInputLabel = {
            current: "현재 비밀번호",
            new: "새 비밀번호",
            confirmNew: "새 비밀번호 확인"
        }
    }
    componentDidMount() {
        this.initChangePasswordText();
    }
    openChangePassModal() {
        this.changePassModalRef.current.showModal();
    }
    changePaswordPostButtonAction() {
        let formData = new FormData();

        for (const key in this.state.changePasswordText) {
            if (this.state.changePasswordText[key].trim() == "") {
                alert(`${this.changePassInputLabel[key]}를 입력해주세요.`)
                return;
            }
            formData.append(camelToBarCase(key), this.state.changePasswordText[key].trim());
        }
        if (this.state.changePasswordText["new"].trim() != this.state.changePasswordText["confirmNew"].trim()) {
            alert('비밀번호랑 확인이랑 다릅니다.');
            return;
        }
        const self = this;
        postSelfWithoutFile(formData, "/api/ch-my-pass").then(data => {
            self.initChangePasswordText();
            self.changePassModalRef.current.hideModal();
            alert('비밀변경 완료. 다시 로그인해주세요.')
            self.props.redirectToRoot();
        }).catch(code => {
            switch (code) {
                case 600:
                    alert('뭔가 안왔습니다.');
                    break;
                case 601:
                    alert('비밀번호랑 확인이 다릅니다.');
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
    initChangePasswordText() {
        this.setState({
            changePasswordText: {
                current: "",
                new: "",
                confirmNew: ""
            }
        })
    }
    changePasswordTextOnChange(e) {
        const name = e.target.name
        if (name) {
            this.setState({
                changePasswordText: {
                    ...this.state.changePasswordText,
                    [name]: e.target.value
                }
            });
        }
    }
    render() {
        return (
            <Modal id="changePasswordModal" title="비밀번호 변경" ref={this.changePassModalRef}>
                <div class="modal-body">
                    <form>
                        <div class="form-group" id="etc">
                            <label >현재 비밀번호</label>
                            <input type="password" id="current-password-input" name="current" class="form-control" value={this.state.changePasswordText["current"]} onChange={this.changePasswordTextOnChange} />
                        </div>
                        <div class="form-group" id="etc">
                            <label >새 비밀번호</label>
                            <input type="password" id="new-password-input" name="new" class="form-control" value={this.state.changePasswordText["new"]} onChange={this.changePasswordTextOnChange} />
                        </div>
                        <div class="form-group" id="etc">
                            <label >새 비밀번호 확인</label>
                            <input type="password" id="confirm-new-password-input" name="confirmNew" class="form-control" value={this.state.changePasswordText["confirmNew"]} onChange={this.changePasswordTextOnChange} />
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-default" data-dismiss="modal">취소</button>
                    <button class="btn btn-primary" onClick={this.changePaswordPostButtonAction}>변경</button>
                </div>
            </Modal>
        );
    }
}

// export default withRouter(ChangePasswordModal, { withRef: true });
export default ChangePasswordModal;