import React, { Component,Fragment } from "react";
import { MainConsumer,UseConsume }  from '../MainProvider.js'
import { Link, withRouter } from 'react-router-dom';

import { 
    getSelf,
    startLoading,
    finLoading,
    unWrapToArray,
    setSelectedCompanyToCookie,
    getRole
} from '../utils/shared_functions.js';

class Header extends Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <Fragment>
                <div className="navbar-header">
                    <button type="button" className="navbar-toggle" data-toggle="collapse" data-target=".navbar-collapse">
                        <span className="sr-only">Toggle navigation</span>
                        <span className="icon-bar"></span>
                        <span className="icon-bar"></span>
                        <span className="icon-bar"></span>
                    </button>
                    <Link className="navbar-brand" to="/dash">Like a Juke Box</Link>
                </div>
            </Fragment>
        );
    }
}

export default UseConsume(Header);