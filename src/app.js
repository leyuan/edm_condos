console.log('hello react & edmonton ');

const CondoContainer = React.createClass({
  loadCondos: function () {
    $.ajax({
      url: this.props.url,
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
        <div>
          <h3>a condo</h3>
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

ReactDOM.render(
  <CondoContainer url="http://localhost:8081/api/condos" />,
  document.getElementById('condo-list')
);
