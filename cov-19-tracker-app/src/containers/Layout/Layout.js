import React, { Component } from 'react';
import axios from 'axios';

import './Layout.css';
import "../../../node_modules/@fortawesome/fontawesome-free/css/all.css";
import * as am4core from "@amcharts/amcharts4/core";
import * as am4maps from "@amcharts/amcharts4/maps";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";
import am4geodata_worldLow from "@amcharts/amcharts4-geodata/worldLow";
import Spinner from '../../components/UI/Spinner';
import Aux from '../../hoc/Auxilliary';


am4core.useTheme(am4themes_animated);

class Layout extends Component {
  state={
    total: 0,
    newConfirmed: 0,
    recovered: 0,
    newRecovered:0,
    death:0,
    newDeath:0,
    country :null
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

          this.setState({
          total: response.data.Global.TotalConfirmed,
          newConfirmed: response.data.Global.NewConfirmed,
          recovered: response.data.Global.TotalRecovered,
          newRecovered: response.data.Global.NewRecovered,
          death: response.data.Global.TotalDeaths,
          newDeath: response.data.Global.NewDeaths, 
          country: updatedCountryData
          })
          this.renderHandler();
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
    if(this.state.country)
     {polygonSeries.data = [...this.state.country];}  
    map.series.push(polygonSeries);
    
    console.log(polygonSeries.data);
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

  render() {
    const content =  (<Aux>
      <div className="container">
       <div className="layer"></div>
       <div id="chartdiv"></div>
       <div className="sidebar">
       <div className="box">
         <h4>Total Cases:</h4>
         <h1>{this.state.total}</h1>
         <p>+{this.state.newConfirmed}<em>(In 24 hours)</em></p>
       </div>
       <div className="box">
         <h4>Deaths:</h4>
         <h1 className='red'>{this.state.death}</h1>
         <p className="small-red">+{this.state.newDeath}<em>(In 24 hours)</em></p>
       </div>
    <div className="box">
        <h4>Recovered:</h4>
        <h1 className='green'>{this.state.recovered}</h1>
        <p className="small-green">+{this.state.newRecovered}<em>(In 24 hours)</em></p>
    </div>
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
        <h1 className="header">COVID-19 TRACKER</h1>
        {(this.state.country) ? content : <Spinner/>}
      </div>
    );
  }
}

export default Layout;
