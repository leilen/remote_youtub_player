import React, { Component,Fragment } from "react";
import { Link } from 'react-router-dom';
import {checkRoles} from '../utils/shared_functions'

import { MainConsumer,UseConsume }  from '../MainProvider.js'


class SideBar extends Component {
    constructor(props, context) {
        super(props);
        this.state = {
            menuData : [
                {
                    "href" : "/dash",
                    "title" : "Dashboard",
                    "icon" : "fa-dashboard"
                }
            ]
        }
    }

    parentMenu(e){
        e.preventDefault();
        e.stopPropagation();
        const target = e.currentTarget;
        $(target).parent("li").toggleClass("active").children("ul").collapse("toggle");
        $(target).parent("li").siblings().removeClass("active").children("ul.in").collapse("hide");
    }

    render() {
        const url = window.location;
        const width = (window.innerWidth > 0) ? window.innerWidth : screen.width;
        const isCollapse = width < 768 ? true : false;

        return (
            <Fragment>
                <div className="navbar-default sidebar" role="navigation">
                    <div className={`sidebar-nav navbar-collapse ${isCollapse ? "collapse" : ""}`}>
                    <MainConsumer>
                            {
                                (consume) => (
                        <ul className="nav" id="side-menu">
                            {
                                this.state.menuData.filter(v1=>{return v1["roles"] ? consume.actions.checkRoles(v1["roles"]) : true}).map(v =>{
                                    let menuJSX;
                                    if (v["sub"]){
                                        const parentMenu = (
                                            <a onClick={this.parentMenu}><i className={`fa fa-fw ${v["icon"]}`}></i> {v["title"]}<span className="fa arrow"></span></a>
                                        )
                                        let isActive = false;
                                        const subMenuList = v["sub"].filter(v2=>{return v2["roles"] ? consume.actions.checkRoles(v2["roles"]) : true}).map(v2 =>{
                                            if (url.pathname == v2["href"]){
                                                isActive = true;
                                            }
                                            return (
                                                <li>
                                                    <Link className={url.pathname == v2["href"] ? "active" : false} to={v2["href"]}>{v2["title"]}</Link>
                                                </li>
                                            )
                                        });
                                        menuJSX = (
                                            <li>
                                                {parentMenu}
                                                <ul className={`nav nav-second-level ${isActive ? "in" : "collapse"}`}>
                                                    {subMenuList}
                                                </ul>
                                            </li>
                                        )
                                    }else{
                                        menuJSX = (
                                            <li>
                                                <Link className={url.pathname == v["href"] ? "active" : false} to={v["href"]}><i className={`fa fa-fw ${v["icon"]}`}></i> {v["title"]}</Link>
                                            </li>
                                        )
                                    }
                                    return menuJSX;
                                })
                            }
                        </ul>
                                )
                        }
                        </MainConsumer>
                    </div>
                </div>
            </Fragment>
        );
    }
}
SideBar.defaultProps = {
    sideIndex: {
        x: 0,
        y: 0
    },
    auth: []
}

export default SideBar;