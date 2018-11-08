import React, { Component } from "react";

class BreadCrumbs extends Component {

    render() {
        return (
            <div className="row">
                <div className="col-lg-12">
                    <h1 className="page-header">{this.props.title}</h1>
                </div>
            </div>
        );
    }
}

BreadCrumbs.defaultProps = {
    title: '기본이름'
}

export default BreadCrumbs;