import React, { Component } from 'react';
import axios from 'axios';

import './Layout.css';
import "../../../node_modules/@fortawesome/fontawesome-free/css/all.css";
import * as am4core from "@amcharts/amcharts4/core";
import * as am4maps from "@amcharts/amcharts4/maps";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";
import am4geodata_worldLow from "@amcharts/amcharts4-geodata/worldLow";
import Spinner from '../../components/UI/Spinner';
import Aux from '../../hoc/Auxilliary';


am4core.useTheme(am4themes_animated);

class Layout extends Component {
  state={
    pieData: [],
    total: 0,
    recovered: 0,
    death: 0,
    Country: "Global",
    Countries :null,
    switchPie: false,
    width: 1080
 } 
 componentWillMount(){
  this.setState({width: window.innerWidth});
  }
  componentDidMount() {
    axios.get('https://api.covid19api.com/summary')
        .then(response => {
          const countryData = response.data.Countries;
          const greenLand = {
            "Country": "Greenland",
              "id": "GL",
              "NewConfirmed": 0,
              "value": 12,
              "NewDeaths": 0,
              "TotalDeaths": 0,
              "NewRecovered": 0,
              "TotalRecovered": 11
          }
          const updatedCountryData = countryData.map( country => {
            return {
              "Country": country.Country,
              "id": country.CountryCode,
              "NewConfirmed": country.NewConfirmed,
              "value": country.TotalConfirmed,
              "NewDeaths": country.NewDeaths,
              "TotalDeaths": country.TotalDeaths,
              "NewRecovered": country.NewRecovered,
              "TotalRecovered": country.TotalRecovered
            }
            
          });
          updatedCountryData.push(greenLand);
          const  pieData = [{
            "category": "New Confirmed",
            "value": response.data.Global.NewConfirmed
          }, {
            "category": "New Deaths",
            "value": response.data.Global.NewDeaths
          }, {
            "category": "New Recovered",
            "value": response.data.Global.NewRecovered
          }];
          this.setState({
          total: response.data.Global.TotalConfirmed,
          recovered: response.data.Global.TotalRecovered,
          death: response.data.Global.TotalDeaths,
          pieData: pieData, 
          Countries: updatedCountryData
          })
          if(this.state.width > 500){ 
            this.renderHandler();
          }
          else{ 
            this.renderMobileViewHandler();
          }
          this.renderPieHandler();
        }
        ).catch(error => alert("Network Error! Please refresh the page."));    

  }

  renderHandler = () => {
    // Create map instance
    var map = am4core.create("chartdiv", am4maps.MapChart);

    // Set map definition
    map.geodata = am4geodata_worldLow;

    // Set projection
    map.projection = new am4maps.projections.Miller();

    // Create map polygon series
    var polygonSeries = map.series.push(new am4maps.MapPolygonSeries());

    // Make map load polygon (like country names) data from GeoJSON
    polygonSeries.useGeodata = true;
    
    // Add expectancy data
    if(this.state.Countries)
     {polygonSeries.data = [...this.state.Countries];}  
    map.series.push(polygonSeries);
    
    // Configure series
    let polygonTemplate = polygonSeries.mapPolygons.template;
    // polygonTemplate.tooltipText = "{name}\n Total:{value}\n Deaths:{TotalDeaths}\n Recovered:{TotalRecovered}";
    polygonTemplate.tooltipHTML = `<div class="tooltip"> 
             <img src="https://www.countryflags.io/{id}/shiny/64.png"><br/>
             <strong> {name}</strong> <hr />
             <table>
             <tr>
             <th align="left">Total:</th>
             <td align="right">{value}</td>
             </tr>
             <tr>
             <th align="left">Deaths:</th>
             <td align="right">{TotalDeaths}</td>
             </tr>
             <tr>
             <th align="left">Recovered:</th>
             <td align="right">{TotalRecovered}</td>
             </tr>
             </table>
            </div>`;    
    polygonTemplate.fill = am4core.color("#fff");
    polygonTemplate.propertyFields.fill = "color";

    // Create hover state and set alternative fill color
    let hs = polygonTemplate.states.create("hover");
    hs.properties.fill = am4core.color("#3c5bdc");

    // Remove Antarctica
    polygonSeries.exclude = ["AQ"];

    // Add heat rule
    polygonSeries.heatRules.push({
      "property": "fill",
      "target": polygonSeries.mapPolygons.template,
       "min": map.colors.getIndex(1).brighten(1),
       "max": map.colors.getIndex(1).brighten(-0.3),
       "logarithmic": true
    });
    
    // Bind "fill" property to "fill" key in data
    polygonTemplate.propertyFields.fill = "fill"; 

    map.seriesContainer.draggable = false;
  }

  renderMobileViewHandler = () => {
    // Create map instance
    var map = am4core.create("chartdiv", am4maps.MapChart);

    // Set map definition
    map.geodata = am4geodata_worldLow;

    // Set projection
    map.projection = new am4maps.projections.Orthographic();
    map.deltaLatitude = -30;

    // Create map polygon series
    var polygonSeries = map.series.push(new am4maps.MapPolygonSeries());
    polygonSeries.useGeodata = true;
    polygonSeries.north = 90;
    polygonSeries.south = -90;
    map.panBehavior = "rotateLongLat";

    // Make map load polygon (like country names) data from GeoJSON
    polygonSeries.useGeodata = true;
    
    // Add expectancy data
    if(this.state.Countries)
     {polygonSeries.data = [...this.state.Countries];}  
    map.series.push(polygonSeries);
    
    // Configure series
    let polygonTemplate = polygonSeries.mapPolygons.template;
    // polygonTemplate.tooltipText = "{name}\n Total:{value}\n Deaths:{TotalDeaths}\n Recovered:{TotalRecovered}";
    polygonTemplate.tooltipHTML = `<div class="tooltip"> 
             <img src="https://www.countryflags.io/{id}/shiny/64.png"><br/>
             <strong> {name}</strong> <hr />
             <table>
             <tr>
             <th align="left">Total:</th>
             <td align="right">{value}</td>
             </tr>
             <tr>
             <th align="left">Deaths:</th>
             <td align="right">{TotalDeaths}</td>
             </tr>
             <tr>
             <th align="left">Recovered:</th>
             <td align="right">{TotalRecovered}</td>
             </tr>
             </table>
            </div>`;    
    polygonTemplate.fill = am4core.color("#fff");
    polygonTemplate.propertyFields.fill = "color";

    // Create hover state and set alternative fill color
    let hs = polygonTemplate.states.create("hover");
    hs.properties.fill = am4core.color("#A7D613");

    // Remove Antarctica
    polygonSeries.exclude = ["AQ"];

    // Add heat rule
    polygonSeries.heatRules.push({
      "property": "fill",
      "target": polygonSeries.mapPolygons.template,
       "min": map.colors.getIndex(1).brighten(1),
       "max": map.colors.getIndex(1).brighten(-0.3),
       "logarithmic": true
    });
    
    // Bind "fill" property to "fill" key in data
    map.backgroundSeries.mapPolygons.template.polygon.fill = am4core.color("#f5f5f5");
    map.backgroundSeries.mapPolygons.template.polygon.fillOpacity = 1;
  }

  renderPieHandler = () => {
    // Create chart instance
    var chart = am4core.create("piediv", am4charts.PieChart3D);

    // Let's cut a hole in our Pie chart the size of 40% the radius
    chart.innerRadius = am4core.percent(40);

    // Add data
    chart.data = this.state.pieData;

    // Add and configure Series
    var pieSeries = chart.series.push(new am4charts.PieSeries3D());
    pieSeries.dataFields.value = "value";
    pieSeries.dataFields.category = "category";
    pieSeries.slices.template.stroke = am4core.color("#fff");
    pieSeries.slices.template.strokeWidth = 2;
    pieSeries.slices.template.strokeOpacity = 1;

    chart.legend = new am4charts.Legend();
    chart.legend.position = "bottom";

    // Disabling labels and ticks on inner circle
    pieSeries.labels.template.disabled = true;
    pieSeries.ticks.template.disabled = true;

    // Disable sliding out of slices
    pieSeries.slices.template.states.getKey("hover").properties.shiftRadius = 0;
    pieSeries.slices.template.states.getKey("hover").properties.scale = 1.1;
    this.chart = chart;
  }

  liveDataHandler = (event) => {
    
    let country = this.state.Countries.filter(c => c.Country == event.target.value);
    let current = country.pop();
    this.setState({Country: current.Country});
    let  data =  [{
        "category": "New Confirmed",
        "value": current.NewConfirmed
      }, {
        "category": "New Deaths",
        "value": current.NewDeaths
      }, {
        "category": "New Recovered",
        "value": current.NewRecovered
      }];
    this.setState({pieData: data, switchPie: true});
  } 

  componentDidUpdate(){
    if(this.state.switchPie){
      this.chart.data = this.state.pieData; 
    }
  }

  render() {
    let options = ( this.state.Countries ? 
      (this.state.Countries).map(i => 
      <option key={i.id} value={i.Country}>{i.Country}</option>)
     : [] );
    options.push(<option key={0} value="Global">{this.state.Country}</option>);
    const content =  (<Aux>
    <div className="container">
       <div id="chartdiv"></div>
       <div className="sidebar">
          <div className="side-head">Last 24 hour Data <br/>
          <select value={this.state.Country}
          onChange={(e) => {this.liveDataHandler(e)}}>
            {options}
          </select>
          </div>
          <br/>
          <div id="piediv"></div>
       </div>       
    </div>
    <div className="footer">
      <span className="developer">Developed By</span>
      <a href="https://www.linkedin.com/in/tanyasingh27/">        
        <i className="fab fa-linkedin"></i>
      </a>
      <a href="https://github.com/tanyasingh27">
        <i className="fab fa-github"></i>
      </a>
      <span className="copy">Copyright &copy; 2020</span>
      <span className="credits">
        Icons made by <a href="https://www.flaticon.com/authors/freepik" title="Freepik">Freepik </a> 
        from <a href="https://www.flaticon.com/" title="Flaticon"> www.flaticon.com</a>
      </span>
    </div>
    </Aux>); 
    return (
      <div>
        <h1 className="header"><span className="logo-heading">C<img src={require("../../images/cov-logo.png")} alt="logo"/>VID-19</span> TRACKER</h1>
        {(this.state.Countries) ? content : <Spinner/>}
      </div>
    );
  }
}

export default Layout;
