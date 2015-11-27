var classNames = require("classnames");
var React = require("react/addons");

var TooltipMixin = require("../mixins/TooltipMixin");
var AppHealthBreakdownComponent = require("./AppHealthBreakdownComponent");
var Util = require("../helpers/Util");
var AppStatus = require("../constants/AppStatus");
var HealthStatus = require("../constants/HealthStatus");

function roundWorkaround(x) {
  return Math.floor(x * 1000) / 1000;
}

var healthNameMap = {
  [HealthStatus.HEALTHY]: "healthy",
  [HealthStatus.UNHEALTHY]: "unhealthy",
  [HealthStatus.UNKNOWN]: "running",
  [HealthStatus.STAGED]: "staged",
  [HealthStatus.OVERCAPACITY]: "over-capacity",
  [HealthStatus.UNSCHEDULED]: "unscheduled"
};

var appHealthBreakdownFields = [
  {label: "Healthy", key: "healthy", state: HealthStatus.HEALTHY},
  {label: "Unhealthy", key: "unhealthy", state: HealthStatus.UNHEALTHY},
  {label: "Unknown", key: "unknown", state: HealthStatus.UNKNOWN}
];

var AppHealthComponent = React.createClass({
  displayName: "AppHealthComponent",

  mixins: [TooltipMixin],

  propTypes: {
    model: React.PropTypes.object.isRequired
  },

  getInitialState: function () {
    return {
      tipContent: this.getAppHealthBreakdown()
    };
  },

  shouldComponentUpdate: function (nextProps) {
    var shouldUpdate =
      !Util.compareArrays(this.props.model.health, nextProps.model.health);
    if (shouldUpdate) {
      this.setState({tipContent: this.getAppHealthBreakdown()});
    }
    return shouldUpdate;
  },

  handleMouseOverHealthBar: function (ref) {
    var el = this.refs[ref].getDOMNode();
    this.tip_showTip(el);
  },

  handleMouseOutHealthBar: function (ref) {
    var el = this.refs[ref].getDOMNode();
    this.tip_hideTip(el);
  },

  getHealthBar: function () {
    var props = this.props;
    var {health, status} = props.model;

    if (status === AppStatus.DEPLOYING) {
      return (
        <div
          className="loading-bar"
          ref="loadingBar"
          key="loadingBar"
          data-behavior="show-tip"
          data-tip-type-class="default"
          data-tip-place="top"
          data-tip-content={this.state.tipContent}
          onMouseOver=
            {this.handleMouseOverHealthBar.bind(null, "loadingBar")}
          onMouseOut=
            {this.handleMouseOutHealthBar.bind(null, "loadingBar")} />
      );
    }

    // normalize quantities to add up to 100%. Cut off digits at
    // third decimal to work around rounding error leading to more than 100%.
    var dataSum = health.reduce(function (a, x) {
      return a + x.quantity;
    }, 0);

    var allZeroWidthBefore = true;
    return health.map(function (d, i) {
      var name = healthNameMap[d.state];
      var width = roundWorkaround(d.quantity * 100 / dataSum);
      var classSet = {
        // set health-bar-inner class for bars in the stack which have a
        // non-zero-width left neightbar
        "health-bar-inner": width !== 0 && !allZeroWidthBefore,
        "progress-bar": true
      };
      // add health bar name
      classSet["health-bar-" + name] = true;

      if (width !== 0) {
        allZeroWidthBefore = false;
      }

      let attributes = {};
      if (d.quantity > 0) {
        let ref = "healthBar-" + i;
        attributes = {
          "ref": ref,
          "data-behavior": "show-tip",
          "data-tip-type-class": "default",
          "data-tip-place": "top",
          "data-tip-content": this.state.tipContent,
          "onMouseOver": this.handleMouseOverHealthBar.bind(null, ref),
          "onMouseOut": this.handleMouseOutHealthBar.bind(null, ref)
        };
      }

      return (
        <div
          className={classNames(classSet)}
          style={{width: width + "%"}}
          {...attributes}
          key={i} />
      );
    }.bind(this));
  },

  getAppHealthBreakdown: function () {
    let component = (
      <AppHealthBreakdownComponent
        fields={appHealthBreakdownFields}
        model={this.props.model} />
    );
    return React.renderToString(component);
  },

  render: function () {
    return (
      <div className="progress health-bar">
        {this.getHealthBar()}
      </div>
    );
  }
});

module.exports = AppHealthComponent;
