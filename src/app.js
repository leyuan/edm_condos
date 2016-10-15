console.log('hello react & edmonton ');

var ReactRouter = window.ReactRouter
var Router = ReactRouter.Router
var Route = ReactRouter.Route
var Link = ReactRouter.Link
var Redirect = ReactRouter.Redirect
var browserHistory = ReactRouter.browserHistory

const CondoContainer = React.createClass({
  loadCondos: function () {
    $.ajax({
      url: 'http://localhost:8081/api/condos',
      dataType: 'json',
      cache: false,
      success: function (data) {
        console.log(data);
        this.setState({data: data});
      }.bind(this),
      error: function (xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  getInitialState: function () {
    return { data: [] };
  },
  componentDidMount: function () {
    this.loadCondos();
  },
  render: function() {
    return (
      <div className="condo-container">
        <h1>Welcome to Edmonton Condos</h1>
        <CondoList data={this.state.data} />
      </div>
    );
  }
});

const CondoList = React.createClass({
  render: function() {
    const condoNodes = this.props.data.map(function(condo) {
      return (
        <div key={condo.addr}>
          <h3>a condo</h3>
          <Link to={`/condo`}>please</Link>
          {condo.addr}
        </div>
      );
    });
    return (
      <div className="className">
        {condoNodes}
      </div>
    );
  }
});

const CondoInfo = React.createClass({
  render() {
    return(
      <h3>Oh hello this is condo page</h3>
    );
  },
});

var StaticRoute = React.createClass({
  render: function() {
    return (
      <Router history={browserHistory}>
        <Route path="/" component={CondoContainer} />
        <Route path="/condo" component={CondoInfo} />
      </Router>
    );
  }
});
ReactDOM.render(<StaticRoute />,  document.getElementById('app'));
