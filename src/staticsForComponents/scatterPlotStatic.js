// chart static params
const initial_width_scatterPlot = document.getElementById('scatterPlot').offsetWidth-10;
const initial_height_scatterPlot = document.getElementById('scatterPlot').offsetHeight;
const scatter_xLabel = 'GDP for year';;
const scatter_yLabel = 'GDP per capita';
const scatter_circle_size = 6;
const scatter_selected_circle_size = 10;
const scatter_transition_time = 1000;
const scatter_points_delay = 12;

// set the dimensions and margins of the graph
const margin_scatterPlot = {top: 25, right: 30, bottom: 55, left: 80},
    width_scatterPlot = initial_width_scatterPlot - margin_scatterPlot.left - margin_scatterPlot.right,
    height_scatterPlot = initial_height_scatterPlot - margin_scatterPlot.top - margin_scatterPlot.bottom;

// needed for update
var idleTimeout;
const idled = () =>  idleTimeout = null;

// set data iterators
const countryScatter = d => d.key
const xValueScatter = d => d.value.gdp_for_year;
const yValueScatter = d => d.value.gdp_per_capita;
const colorValueScatter = d => d.value.suicides_pop;

// set scales ranges
const xScaleScatter = d3.scaleLinear() 
    .range([ 0, width_scatterPlot ])

const yScaleScatter = d3.scaleLinear()
    .range([ height_scatterPlot, 0])
    .nice();

// vars for brush
let scatter_toggle_brush = false;
const scatterBrush = d3.brush()                 
    .extent( [ [0,0], [width_scatterPlot,height_scatterPlot] ] )

// append the svg object to the body of the page
const svgScatterPlot = d3.select("#scatterPlot")
    .append("svg")
      .attr("width", initial_width_scatterPlot)
      .attr("height", initial_height_scatterPlot)
    .append("g")
      .attr("transform", "translate(" + margin_scatterPlot.left + "," + margin_scatterPlot.top + ")");  //padding


// add label left
const scatter_left_label_x = ((margin_scatterPlot.left/5) * 3) +3;
const scatter_left_label_y = (height_scatterPlot/2);
svgScatterPlot.append('text')
    .attr('class', 'axis-label')
    .attr("text-anchor", "middle")
    .attr("transform", `translate(${-scatter_left_label_x}, ${scatter_left_label_y}), rotate(-90)`) 
    .text(scatter_yLabel)


// add label bottom
const scatter_bottom_label_x = width_scatterPlot/2;
const scatter_bottom_label_y = height_scatterPlot + ((margin_scatterPlot.bottom/6)*5);
svgScatterPlot.append('text')
    .attr('class', 'axis-label')
    .attr("text-anchor", "middle")
    .attr("transform", `translate(${scatter_bottom_label_x},${scatter_bottom_label_y})`) //to put on bottom
    .text(scatter_xLabel)

// add X axis
const scatterXAxisSvg = svgScatterPlot.append("g")
    .attr("transform", "translate(0," + height_scatterPlot + ")") //to put on bottom

// add Y axis
const scatterYAxisSvg = svgScatterPlot.append("g")

// add Grids
const scatterXGridSvg = svgScatterPlot.append('g').attr('class', 'grid-scatter') 
const scatterYGridSvg = svgScatterPlot.append('g').attr('class', 'grid-scatter') 


// Add a clipPath: everything out of this area won't be drawn.
const scatterClip = svgScatterPlot.append("defs").append("svg:clipPath")
    .attr("id", "clip")
    .append("svg:rect")
    .attr("width", width_scatterPlot )
    .attr("height", height_scatterPlot )
    .attr("x", 0)
    .attr("y", 0);


// Create the scatter variable: where both the circles and the brush take place
const scatterArea = svgScatterPlot.append('g')
    .attr("clip-path", "url(#clip)")


const tooltipScatter = d3.select("#scatterPlot")
    .append("div")
    .style("left", widthMap + initial_width_legend + "px")   
    .style("top",  heightMap + "px") //heightMap + "px")
    .style("opacity", 0)
    .attr("class", "tooltip")