import React, { Component, Fragment } from "react";
import { withRouter } from 'react-router-dom'

import { MainProvider }  from './MainProvider.js'

// import PreLoader from './templates/PreLoader.jsx';
import Header from './templates/Header.js';
import SideBar from './templates/SideBar.js';

import DashPage from './DashPage.js';

import { Route,Switch } from 'react-router-dom';


class App extends Component {
    constructor(props) {
        super(props);
        this.setSideBar = this.setSideBar.bind(this);
        this.openChangePassModal = this.openChangePassModal.bind(this);
        this.setIsLoginPage = this.setIsLoginPage.bind(this);
        this.redirectToRoot = this.redirectToRoot.bind(this);
        this.state = {
            sideIndex: {
                x: 0,
                y: 0
            },
            isLoginPage : false
        }
    }
    componentDidMount() {
    }

    setSideBar(sideIndex, refresh) {
        this.setState({
            sideIndex: !sideIndex ? this.sideIndex : sideIndex,
            refresh: refresh
        });
    }
    openChangePassModal(){
        this.changePassModalRef.current.openChangePassModal();
    }
    setIsLoginPage(flag){
        this.setState({
            isLoginPage : flag
        })
    }
    redirectToRoot(){
        this.props.history.replace('/');
    }
    render() {
        return (
            <MainProvider>
                {
                    !this.state.isLoginPage && (
                        <nav class="navbar navbar-default navbar-static-top" role="navigation" style={{"margin-bottom" : "0px"}}>
                            <Header openChangePassModal={this.openChangePassModal} redirectToRoot={this.redirectToRoot}/>
                            <SideBar sideIndex={this.state.sideIndex} refresh={this.state.refresh} />    
                        </nav>
                    )
                }
                <div id="main-wrapper">
                    <div className={this.state.isLoginPage ? "container" : "page-wrapper"} id={this.state.isLoginPage ? false : "page-wrapper"}>
                    <Switch>
                        <Route path="/" render={(props) => (
                            <DashPage {...props} setSideBar={this.setSideBar} />
                        )} />
                    </Switch>


                    </div>
                </div>
            </MainProvider>
        );
    }
}

// export default App;
export default withRouter(App);