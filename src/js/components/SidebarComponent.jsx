var Link = require("react-router").Link;
var React = require("react/addons");

var AppListLabelsFilterComponent =
  require("../components/AppListLabelsFilterComponent");
var AppListStatusFilterComponent =
  require("../components/AppListStatusFilterComponent");
var FilterTypes = require("../constants/FilterTypes");

var QueryParamsMixin = require("../mixins/QueryParamsMixin");

var SidebarComponent = React.createClass({
  displayName: "SidebarComponent",

  mixins: [QueryParamsMixin],

  contextTypes: {
    router: React.PropTypes.func
  },

  propTypes: {
    groupId: React.PropTypes.string.isRequired,
    onChange: React.PropTypes.func.isRequired
  },

  getInitialState: function () {
    return {
      filters: {
        [FilterTypes.LABELS]: [],
        [FilterTypes.STATUS]: []
      }
    };
  },

  updateFilter: function (filterName, filter) {
    var filters = Object.assign({}, this.state.filters, {
      [filterName]: filter
    });

    this.setState({
      filters: filters
    }, this.props.onChange(filters));
  },

  render: function () {
    var path = this.context.router.getCurrentPathname();
    var props = this.props;

    var newAppModalQuery = {
      modal: "new-app"
    };

    if (props.groupId != null && props.groupId !== "/") {
      newAppModalQuery.groupId = props.groupId;
    }

    return (
      <nav className="sidebar">
        <Link to={path}
          query={newAppModalQuery}
          className="btn btn-success create-app"
          activeClassName="create-app-active">
          Create
        </Link>
        <div className="flex-row">
          <h3 className="small-caps">Status</h3>
          {this.getClearLinkForFilter(FilterTypes.STATUS)}
        </div>
        <AppListStatusFilterComponent
          onChange={this.updateFilter.bind(null, FilterTypes.STATUS)} />
        <div className="flex-row">
          <h3 className="small-caps">Label</h3>
          {this.getClearLinkForFilter(FilterTypes.LABELS)}
        </div>
        <AppListLabelsFilterComponent
          onChange={this.updateFilter.bind(null, FilterTypes.LABELS)} />
      </nav>
    );
  }
});

module.exports = SidebarComponent;
