// width and weight of the whole container
const widthMap = document.getElementById('map-holder').offsetWidth;
const heightMap = document.getElementById('map-holder').offsetHeight;
const geoJsonUrl = "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson";
const strokeColorMap = '#377eb8';//'#92c5de';
const fillColorMap = '#a6cee3';
const maxOpacity = 1;
const minOpacity = .6;
const selectedColorsMap = ['#762a83','#af8dc3','#e7d4e8','#d9f0d3','#7fbf7b','#1b7837'];
const maxSelectCountries = 3;



let firstAdded = null; // used to save the oldest between selected states

// set iterators
const nameMap = (d) => d.properties.name; 
const totalMap = (d) =>  d.total;

const countryMap = (d) => d.key
const suicidesValue = (d) => d.value.suicides_pop;

// zoom and pan
let zoomMap = d3.zoom()
    .scaleExtent([1, 2.5])
    .translateExtent([[-widthMap/10, -heightMap/10], [widthMap + widthMap/10, heightMap + heightMap/10]])
    .on('zoom', () => {
        map.attr('transform', d3.event.transform)
});



// create SVG
const map = d3.select( '#map-holder' )
  .append( "svg" )
  .attr( "width", '100%' )
  .attr( "height", '100%' )
  .attr('viewBox', ("0 0 "+ widthMap + " " + heightMap));

// create path and projection
const path = d3.geoPath();
const projection = d3.geoMercator()
  .scale(120 , 70)
  .center([0, 25])
  .translate([widthMap/2, heightMap/2]);


const tooltipMap = d3.select("#map-holder")
  .append("div")
  .style("opacity", 0)
  .attr("class", "tooltip");


    

   