////////////////////////// CONTROLLER MISCELLANEOUS //////////////////////////
const parseRow = (d) => {
  d.year = +d.year;
  d.suicides_no = +d.suicides_no;
  d.population =  +d.population;
  d.suicides_pop = +d.suicides_pop;
  d.gdp_for_year = +d.gdp_for_year;
  d.gdp_per_capita = +d.gdp_per_capita;
  d.PCA_1 = +d.PCA_1;
  d.PCA_2 = +d.PCA_2;
  return d;
};



////////////////////////// INDEX FUNCTIONS //////////////////////////

// year filter from header
const yearSelected = () => {
    const yearSelector = document.getElementById("year-selector");
    const selectedYear = yearSelector.options[yearSelector.selectedIndex].value;
    controller.triggerYearFilterEvent(selectedYear);
};


// year filter from header
const switchVisualizationSet = () => {
  if (controller.selectedCountries.length == 0) {
    document.getElementById('radar').style.display = 'none';
    document.getElementById('lineChart').style.display = 'none';
    document.getElementById('scatterPlot').style.display = 'block';
    document.getElementById('pca').style.display = 'block';
  } else {
    document.getElementById('radar').style.display = 'block';
    document.getElementById('lineChart').style.display = 'block';
    document.getElementById('scatterPlot').style.display = 'none';
    document.getElementById('pca').style.display = 'none';
  }
  
};


// reload any time the window changes size
let resizeTimeout;
window.addEventListener('resize', function(event) {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(function(){
    window.location.reload();
  }, 100);
});




////////////////////////// DATA AGGREGATORS //////////////////////////
const aggregateDataByYearLineChart = (dataIn) => {
  const data = d3.nest()
  //.key( (d) => d.country)
  .key( (d) => d.year)
  .rollup( (d) =>  ({
      suicides_pop: Math.round(d3.mean(d, (g) => g.suicides_pop)),
      gdp_for_year: Math.round(d3.mean(d, (g) => g.gdp_for_year)), 
      gdp_per_capita: Math.round(d3.mean(d, (g) => g.gdp_per_capita))
  }))
  .entries(dataIn);
  return data;
};

const aggregateDataByCountryRadar = (dataIn) => {
  //console.log(dataIn);
  if(controller.isYearFiltered){
    const data = d3.nest()
    .key( (d) => d.country)
    .rollup( (d) =>  ({
      suicides_pop: Math.round(d3.mean(d, (g) => g.suicides_pop)),
      gdp_for_year: Math.round(d3.mean(d, (g) => g.gdp_for_year)),    
      gdp_per_capita: Math.round(d3.mean(d, (g) => g.gdp_per_capita)),
      suicides_no: Math.round(d3.sum(d,(g) => g.suicides_no)),
      population: Math.round(d3.sum(d, (g) => g.population))
    }))
    .entries(dataIn);
    console.log(data);
    return data;
  }
  else{
    const data = d3.nest()
    .key( (d) => d.country)
    .key( (d) => d.year)
    .rollup( (d) =>  ({
      suicides_pop: Math.round(d3.mean(d, (g) => g.suicides_pop)),
      gdp_for_year: Math.round(d3.mean(d, (g) => g.gdp_for_year)),    
      gdp_per_capita: Math.round(d3.mean(d, (g) => g.gdp_per_capita)),
      suicides_no: Math.round(d3.sum(d,(g) => g.suicides_no)),
      population: Math.round(d3.sum(d, (g) => g.population))
    }))
    .entries(dataIn);
    
    let res = [];

    for(let el in data){
      //console.log(data[el]);
      let suicides_pop = 0;
      let suicides_no = 0;
      let gdp_for_year = 0;
      let gdp_per_capita = 0;
      let population = 0;
      let i = 0;
      //console.log(data[el].values);
      for(let item in data[el].values){
        suicides_pop = suicides_pop + data[el].values[item].value.suicides_pop;
        suicides_no = suicides_no + data[el].values[item].value.suicides_no;
        gdp_for_year = gdp_for_year + data[el].values[item].value.gdp_for_year;
        gdp_per_capita = gdp_per_capita + data[el].values[item].value.gdp_per_capita;
        population = population + data[el].values[item].value.population;
        i++;
      }
      let value = {
        'suicides_pop': Math.round(suicides_pop/i),
        'suicides_no': Math.round(suicides_no),
        'gdp_for_year': Math.round(gdp_for_year/i),
        'gdp_per_capita': Math.round(gdp_per_capita/i),
        'population': Math.round(population/i)
      }
      res.push({
        'key': data[el].key,
        'value': value
      })
      
    }
    //console.log(res);
    return res;
  }
  
};

const aggregateDataByCountry = (dataIn) => {
    const data = d3.nest()
      .key( (d) => d.country)
      .rollup( (d) =>  ({
        suicides_pop: Math.round(d3.mean(d, (g) => g.suicides_pop)),
        gdp_for_year: Math.round(d3.mean(d, (g) => g.gdp_for_year)),    
        gdp_per_capita: Math.round(d3.mean(d, (g) => g.gdp_per_capita))
      }))
    .entries(dataIn)
    return data;
};

const aggregateDataByAge = (dataIn) => {
    const data = d3.nest()
      .key( (d) => d.age)
      .rollup( (d) =>  ({
        suicides_pop: Math.round(d3.mean(d, (g) => g.suicides_pop)),
      }))
    .entries(dataIn)
    return data;
  };

const aggregateDataBySex = (dataIn) => {
    const data = d3.nest()
      .key( (d) => d.sex)
      .rollup( (d) =>  ({
        suicides_pop: Math.round(d3.mean(d, (g) => g.suicides_pop)),
      }))
    .entries(dataIn)
    return data;
  };
  


////////////////////////// MISCELLANEOUS //////////////////////////

// format axis with 3 numbers and change bilions encoding
const AxisTickFormat = number =>
  	d3.format('.2s')(number).replace('G', 'B');

// sum values inside set
const sumSet = mySet => [...mySet].reduce((a,b) => a + b, 0)

const updateAvgAgeBar = function () {
  // remove old avg line for update
  svgAge.selectAll('.avg-line-selected').remove();
  svgAge.selectAll('.avg-label-selected').remove();

  // show avg line for only selected bars (if anything selected)
  if (selectedValuesAge.size > 0){

    // add avg line selected
    const avg_value_selected = Math.round(sumSet(selectedValuesAge)/selectedValuesAge.size *10) /10;
    const avg_value_scaled_selected = yScaleAge(avg_value_selected)
    printAvgYonSelection(svgAge, avg_value_selected, avg_value_scaled_selected, width_ageChart)

  } 
}


// functions to print avg lines
const printAvgY = (svg, avg_value_y, avg_value_scaled_y, width) => {
  // add avg line y
  svg.append("line")
      .transition()
      .duration(scatter_transition_time)
      .attr('class', 'avg-line')
      .attr("x1", 0)
      .attr("x2", width+2)
      .attr("y1", avg_value_scaled_y)
      .attr("y2", avg_value_scaled_y)

  // avg value print for y
  svg.append("text")
      .transition()
      .duration(scatter_transition_time)
      .attr('class', 'avg-label')
      .attr("text-anchor", "middle")
      .attr("transform", `translate(${width-20}, ${avg_value_scaled_y-10})`) 
      .text(d3.format('.2s')(avg_value_y))
}

const printAvgX = (svg, avg_value_x, avg_value_scaled_x, height) => {
  // add avg line x
  svg.append("line")
      .transition()
      .duration(scatter_transition_time)
      .attr('class', 'avg-line')
      .attr("x1", avg_value_scaled_x)
      .attr("x2", avg_value_scaled_x)
      .attr("y1", 0)
      .attr("y2", height+2)

  // avg value print for x
  svg.append("text")
      .transition()
      .duration(scatter_transition_time)
      .attr('class', 'avg-label')
      .attr("text-anchor", "middle")
      .attr("transform", `translate(${avg_value_scaled_x+25}, ${20})`) 
      .text(d3.format('.2s')(avg_value_x).replace('G', 'B'))
}


// functions to print avg lines
const printAvgYonSelection = (svg, avg_value_y, avg_value_scaled_y, width) => {
  // add avg line y
  svg.append("line")
      .transition()
      .duration(scatter_transition_time)
      .attr('class', 'avg-line-selected')
      .attr("x1", 0)
      .attr("x2", width+2)
      .attr("y1", avg_value_scaled_y)
      .attr("y2", avg_value_scaled_y)

  // avg value print for y
  svg.append("text")
      .transition()
      .duration(scatter_transition_time)
      .attr('class', 'avg-label-selected')
      .attr("text-anchor", "middle")
      .attr("transform", `translate(${width-20}, ${avg_value_scaled_y-10})`) 
      .text(d3.format('.2s')(avg_value_y))
}

const printAvgXonSelection = (svg, avg_value_x, avg_value_scaled_x, height) => {
  // add avg line x
  svg.append("line")
      .transition()
      .duration(scatter_transition_time)
      .attr('class', 'avg-line-selected')
      .attr("x1", avg_value_scaled_x)
      .attr("x2", avg_value_scaled_x)
      .attr("y1", 0)
      .attr("y2", height+2)

  // avg value print for x
  svg.append("text")
      .transition()
      .duration(scatter_transition_time)
      .attr('class', 'avg-label-selected')
      .attr("text-anchor", "middle")
      .attr("transform", `translate(${avg_value_scaled_x+25}, ${20})`) 
      .text(d3.format('.2s')(avg_value_x).replace('G', 'B'))
}
