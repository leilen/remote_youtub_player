import React, { Component, Fragment } from "react";
import { UseConsume } from './MainProvider.js'
import {browserHistory} from 'react-router';
import queryString from 'query-string';

import Select2 from 'react-select2-wrapper';
import InfiniteScroll from "react-infinite-scroller";

import 'react-select2-wrapper/css/select2.css';
import '../public/css/search.css';


import {
    getSelf,
    startLoading,
    finLoading,
    unWrapToArray,
    getSelectedValuesFromSelect2,
    unWrapToString,
    postSelf,
    secondToString
} from './utils/shared_functions.js';


class SearchPage extends Component {
    constructor(props, context) {
        super(props);
        this.componentDidMount = this.componentDidMount.bind(this);
        this.loadDataFunc = this.loadDataFunc.bind(this);
        this.onInputFormTextChange = this.onInputFormTextChange.bind(this);
        this.initAllState = this.initAllState.bind(this);
        this.selectOnChange = this.selectOnChange.bind(this);
        this.addButtonAction = this.addButtonAction.bind(this);
        this.addUrlPostButtonAction = this.addUrlPostButtonAction.bind(this);
        this.listClickAction = this.listClickAction.bind(this);
        this.inputFormOnKeyPress = this.inputFormOnKeyPress.bind(this);

        this.addUrlModalRef = React.createRef();
        this.addUrlInputRef = React.createRef();
        this.volumnSpanRef = React.createRef();

        this.state = {
            isVolumeEditable : false,
            inputText: {},
            data: {},
            select: {
            },
        };
        this.isCanLoadMore = true;
        this.startPage = 0;
    }
    componentDidMount() {
        // this.loadDataFunc();
        document.addEventListener('click', this.backgroundOnClickAction);
        this.unlisten = this.props.history.listen((location, action) => {
            this.loadDataFunc();
        });
    }
    componentWillUnmount() {
        document.removeEventListener('click', this.backgroundOnClickAction);
        this.unlisten();
    }
    loadDataFunc(page) {
        const self = this;
        this.queryParams = queryString.parse(location.search);
        if (this.queryParams["keyword"]){
            startLoading();
            getSelf(`/api/search?keyword=${this.queryParams["keyword"]}${page > 1 ? `&page-token=${this.state.data["next-page-token"]}` : ""}`).then(data => {
                this.isCanLoadMore = data["list"].length != 0;
                if (page > 1){
                    self.setState({
                        data: {
                            ...data,
                            list : this.state.data.list.concat(data["list"])
                        }
                    })
                }else{
                    self.setState({
                        data: data
                    })
                }
                finLoading();
            }).catch(code => {
                finLoading();
                switch (code) {
                    case 403:
                        alert(`권한이 없습니다`);
                        break;
                    default:
                        alert(`Error : ${code}`)
                        break;
                }
    
            });
        }
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
    inputFormOnKeyPress(e){
        if (e.target.name == "volume" && e.key === 'Enter') {
            this.volumePostAction();
        }
    }
    initAllState() {
        this.setState({
        });
    }
    addButtonAction() {
        this.addUrlModalRef.current.showModal();
        this.setState({
            inputText:{
                ...this.state.inputText,
                addUrl : ""
            }
        })
        this.addUrlInputRef.current.focus();
        
    }
    addUrlPostButtonAction(i){
        const self = this;
        startLoading();
        let jsonData = {
            "url" : this.state.data.list[i]["url"],
            "title" : this.state.data.list[i]["title"]
        }
        postSelf(jsonData, '/api/add-url').then(data => {
            finLoading();
        }).catch(code => {
            finLoading();
        });
    }
    listClickAction(i){
        if (confirm("이 곡을 추가 할까요?")){
            this.addUrlPostButtonAction(i);
        }
    }
    selectOnChange(e) {
        const name = e.target.name;
        this.selected[name] = getSelectedValuesFromSelect2(this[`${name}SelectRef`])
        if (name == "restTypeList") {
            let selectedType = null;
            if (this.selected[name]) {
                if (this.selected[name].length != 0) {
                    selectedType = this.selected[name][0];
                }
            }
            if (selectedType && this.state.selectedRestType != selectedType) {
                this.setState({
                    selectedRestType: selectedType
                });
            }

        }
    }
    
    
    
    render() {
        const { inputText, data } = this.state;
        return (
            <Fragment>
                <div class="row music-list-row">
                    <div class="col-lg-8">
                        <div class="panel panel-default">
                            <div class="panel-heading">
                                <i class="fa fa-user fa-fw"></i> 검색 목록
                            </div>
                            <div class="panel-body">
                                <div class="list-group">
                                    <InfiniteScroll
                                        pageStart={this.startPage}
                                        loadMore={this.loadDataFunc}
                                        hasMore={this.isCanLoadMore}
                                        useWindow={true}
                                    >
                                    {
                                        unWrapToArray(data["list"]).map((v, i) => {
                                            return (
                                                <div class={`list-group-item clickable search-list`} onClick={this.listClickAction.bind(this,i)}>
                                                    <img src={v["th"]}/>
                                                    <div className="info-wrapper">
                                                        <div class="title">{v["title"]}</div>
                                                        <div class="desc">{v["desc"]}</div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    }
                                    </InfiniteScroll>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </Fragment>
        );
    }
}


export default UseConsume(SearchPage);