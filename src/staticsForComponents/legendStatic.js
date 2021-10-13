// legend static params
const initial_width_legend = document.getElementById('map-legend').offsetWidth;
const initial_height_legend = document.getElementById('map-legend').offsetHeight;
const colorLabel = 'Suicides/100k pop';
const classesInterval = 10;
const namesPerRowTooltip = 10;
const opacityNotOver = 0.5;


// set the dimensions and margins of the graph
const margin_legend = {top: 10, right: 10, bottom: 10, left: 8},
    width_legend = initial_width_legend - margin_legend.left - margin_legend.right,
    height_legend = initial_height_legend - margin_legend.top - margin_legend.bottom;


const svgLegend = d3.select("#map-legend")
    .attr('background', 'white')
    .append("svg")
        .attr("width", initial_width_legend)
        .attr("height", initial_height_legend)
    .append("g")
        .attr("transform", "translate(" + margin_legend.left + "," + margin_legend.top + ")")

const tooltipLegend = d3.select("#map-legend")
    .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip")


