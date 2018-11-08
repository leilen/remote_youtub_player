import React, { Component, Fragment } from "react";
import { BrowserRouter } from 'react-router-dom';
import App from './App.js';

class Root extends Component {
    render() {
        return (
            <BrowserRouter>
                <App/>
            </BrowserRouter>
        );
    }
}

export default Root;