(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

console.log('hello react & edmonton ');

var ReactRouter = window.ReactRouter;
var Router = ReactRouter.Router;
var Route = ReactRouter.Route;
var Link = ReactRouter.Link;
var Redirect = ReactRouter.Redirect;
var browserHistory = ReactRouter.browserHistory;

var CondoContainer = React.createClass({
  displayName: 'CondoContainer',

  loadCondos: function loadCondos() {
    $.ajax({
      url: 'http://localhost:8081/api/condos',
      dataType: 'json',
      cache: false,
      success: function (data) {
        console.log(data);
        this.setState({ data: data });
      }.bind(this),
      error: function (xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  getInitialState: function getInitialState() {
    return { data: [] };
  },
  componentDidMount: function componentDidMount() {
    this.loadCondos();
  },
  render: function render() {
    return React.createElement(
      'div',
      { className: 'condo-container' },
      React.createElement(
        'h1',
        null,
        'Welcome to Edmonton Condos'
      ),
      React.createElement(CondoList, { data: this.state.data })
    );
  }
});

var CondoList = React.createClass({
  displayName: 'CondoList',

  render: function render() {
    var condoNodes = this.props.data.map(function (condo) {
      return React.createElement(
        'div',
        { key: condo.addr },
        React.createElement(
          'h3',
          null,
          'a condo'
        ),
        React.createElement(
          Link,
          { to: '/condo' },
          'please'
        ),
        condo.addr
      );
    });
    return React.createElement(
      'div',
      { className: 'className' },
      condoNodes
    );
  }
});

var CondoInfo = React.createClass({
  displayName: 'CondoInfo',
  render: function render() {
    return React.createElement(
      'h3',
      null,
      'Oh hello this is condo page'
    );
  }
});

var StaticRoute = React.createClass({
  displayName: 'StaticRoute',

  render: function render() {
    return React.createElement(
      Router,
      { history: browserHistory },
      React.createElement(Route, { path: '/', component: CondoContainer }),
      React.createElement(Route, { path: '/condo', component: CondoInfo })
    );
  }
});
ReactDOM.render(React.createElement(StaticRoute, null), document.getElementById('app'));

},{}]},{},[1]);
