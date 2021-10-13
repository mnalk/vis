// chart static params
const initial_width_sexChart = document.getElementById('sexChart').offsetWidth;
const initial_height_sexChart = document.getElementById('sexChart').offsetHeight;
const sex_xLabel = 'Sex';;
const sex_yLabel = 'Suicides/100k pop';
const sex_xPadding = 0.5;
const sex_behindOpacity = 0.4;
const sex_backOffset = 10;
const sex_transition_time = 300;

// set the dimensions and margins of the graph
const margin_sexChart = {top: 25, right: 30, bottom: 50, left: 70},
    width_sexChart = initial_width_sexChart - margin_sexChart.left - margin_sexChart.right,
    height_sexChart = initial_height_sexChart - margin_sexChart.top - margin_sexChart.bottom;


// set data iterators
const xValueSex = d => d.key;
const yValueSex = d => d.value.suicides_pop;

// set scales
const xScaleSex = d3.scaleBand()
  .range([ 0, width_sexChart ])
  .padding(sex_xPadding);

const yScaleSex = d3.scaleLinear()
  .range([ height_sexChart, 0])
  .nice();


// append the svg object to the body of the page
const svgSex = d3.select("#sexChart")
    .append("svg")
      .attr("width", initial_width_sexChart)
      .attr("height", initial_height_sexChart)
    .append("g")
      .attr("transform", "translate(" + margin_sexChart.left + "," + margin_sexChart.top + ")");  //padding
    
// add label left
const sex_left_label_x = ((margin_sexChart.left/5) * 3);
const sex_left_label_y = (height_sexChart/2);
svgSex.append('text')
  .attr('class', 'axis-label')
  .attr("text-anchor", "middle")
  .attr("transform", `translate(${-sex_left_label_x}, ${sex_left_label_y}), rotate(-90)`) 
  .text(sex_yLabel)
  
// add label bottom
const sex_bottom_label_x = width_sexChart/2;
const sex_bottom_label_y = height_sexChart + ((margin_sexChart.bottom/6)*5) ;
svgSex.append('text')
  .attr('class', 'axis-label')
  .attr("text-anchor", "middle")
  .attr("transform", `translate(${sex_bottom_label_x},${sex_bottom_label_y})`) //to put on bottom
  .text(sex_xLabel)
    

// add X axis
const sexXAxisSvg = svgSex.append("g")
    .attr("transform", "translate(0," + height_sexChart + ")") //to put on bottom

// add Y axis
const sexYAxisSvg = svgSex.append("g")

// add Grids
const sexYGridSvg = svgSex.append('g').attr('class', 'grid-barchart')
