import React, { Component } from "react";

class Card extends Component {

    render() {
        return (
            <div className="panel panel-default">
                <div className="panel-heading">
                    {this.props.title}
                </div>
                <div className="panel-body">
                    {this.props.children}
                </div>
            </div>
        );
    }
}

Card.defaultProps = {
    title: ''
}
export default Card;