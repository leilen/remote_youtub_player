import React from 'react';
import ReactDOM from 'react-dom';

import Head from './templates/Head.js';
import Root from './Root.js';



// ReactDOM.render(<PreLoader />, document.getElementById('preloader'));
// ReactDOM.render(<Header />, document.getElementById('header'));
ReactDOM.render(<Head />, document.getElementById('head'));

// ReactDOM.render(<ListPage setSideBar={setSideBar} />, document.getElementById('page-wrapper'));

// ReactDOM.render(<PublicModal />, document.getElementById('public-modal'));
ReactDOM.render(<Root />, document.getElementById('app'));