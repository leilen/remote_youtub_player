import React, { Component } from "react";

class Modal extends Component {
    constructor(props) {
        super(props);
        this.showModal = this.showModal.bind(this);
        this.hideModal = this.hideModal.bind(this);
    }

    showModal(){
        $(`#${this.props.id}`).modal();
    }
    hideModal(){
        $(`#${this.props.id}`).modal('hide');
    }

    render() {
        return (
            <div class="modal fade" id={this.props.id} tabindex="-1" role="dialog" aria-hidden="true">
                <div class="modal-dialog modal-sm" role="document">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h4 class="modal-title">{this.props.title}</h4>
                        </div>
                        {this.props.children}
                    </div>
                </div>
            </div>
        );
    }
}

Modal.defaultProps = {
    id: '',
    title: ''
}

export default Modal;