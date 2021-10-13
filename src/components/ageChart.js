const makeAgeChart = () => {

  ////////////////////////// CALLBACK //////////////////////////

  // callback for mouseover bar
  const mouseOver = function (actual, i) {
    // check needed to avoid bug floating bars
    const nowSize = +this.attributes.y.value
    const finalSize = yScaleAge(this.__data__.value.suicides_pop)

    if (+nowSize == finalSize){
      // show difference on bar insted of orignal value
      d3.selectAll('.bar-value-age')  
      .text((d, idx) => {
        const divergence = (yValueAge(d) - actual.value.suicides_pop).toFixed(1)
        
        let text = ''
        if (divergence > 0) text += '+'
        text += `${divergence}`

        return idx !== i ? text : `${actual.value.suicides_pop}`;
      })
  
      // enlarge bar
      d3.select(this)
      .transition()
      .duration(300)
      .attr('x', (d) => xScaleAge(xValueAge(d)) - 5)
      .attr('width', xScaleAge.bandwidth() + 10)
      .style("cursor", "pointer");
    }
  }


  // callback for mouseLeave bar
  const mouseLeave =  function () {
    // check needed to avoid bug floating bars
    const nowSize = +this.attributes.y.value
    const finalSize = yScaleAge(this.__data__.value.suicides_pop)

    if (+nowSize == finalSize){
    // bar to normal size
    d3.select(this)
      .transition()
      .duration(300)
      .attr('x', (d) => xScaleAge(xValueAge(d)))
      .attr('width', xScaleAge.bandwidth())

    d3.selectAll('.bar-value-age')  
      .text( (d) => yValueAge(d))
    }
    
  }


  // callback for mouseClick bar (with all countries shown)
  const mouseClick = function (e) {
    // toggle bar selection highlight and get class
    if (d3.select(this).classed("selected-object") == false) {
      d3.select(this).classed("selected-object", true)
      selectedBarsAge.add(xValueAge(this.__data__))
      selectedValuesAge.add(yValueAge(this.__data__))

    }  else {
      d3.select(this).classed("selected-object", false);
      selectedBarsAge.delete(xValueAge(this.__data__))
      selectedValuesAge.delete(yValueAge(this.__data__))
    }
    
    // thigger filter
    if (controller.selectedCountries == 0) 
      controller.triggerAgeFilterEvent(selectedBarsAge);
    else 
      controller.triggerAgeFilterEventWithSelectedMap(selectedBarsAge);

    // function inside helper
    updateAvgAgeBar()
  }



  ////////////////////////// SETUP //////////////////////////

  // get data
  const dataAll = aggregateDataByAge(controller.dataAll);
  const dataFiltered = aggregateDataByAge(controller.dataAge);
  const colorScale = controller.colorScale;

  // sort ages
  dataAll.sort((a, b) => d3.ascending(a.key, b.key));
  dataFiltered.sort((a, b) => d3.ascending(a.key, b.key));

  // compute padding on top yAxis (1/10 more than max between dataAll and dataFiltered)
  const max_val_year = d3.max(dataAll, yValueAge) 
  const max_val_filtered = d3.max(dataFiltered, yValueAge) 
  const max_val = (max_val_year >  max_val_filtered) ? max_val_year : max_val_filtered;
  const domain_max = parseInt(max_val) + parseInt(max_val/10) 

  // set axis domain
  xScaleAge.domain(dataAll.map(xValueAge));
  yScaleAge.domain([0, domain_max ]);

  // axis setup
  const xAxis = d3.axisBottom(xScaleAge);
  const yAxis = d3.axisLeft(yScaleAge).tickFormat(AxisTickFormat);

  // compute avg line
  const avg_value = Math.round((d3.sum(dataFiltered, (d) => yValueAge(d))) / dataFiltered.length*10) /10;
  const avg_value_scaled = yScaleAge(avg_value)



  ////////////////////////// CALL COMPONENTS //////////////////////////

  // call X axis
  ageXAxisSvg.transition()
    .duration(controller.transitionTime/2)
    .call(xAxis)
    .selectAll("text")  
      .attr("class","axis-text");

  // call Y axis
  ageYAxisSvg.transition()
    .duration(controller.transitionTime/2)
    .call(yAxis)
    .selectAll("text")
      .attr("class","axis-text");

  // call Grid 
  ageYGridSvg.transition()
    .duration(controller.transitionTime/2)
    .call(d3.axisLeft()
      .scale(yScaleAge)
      .tickSize(-width_ageChart, 0, 0)
      .tickFormat(''))


  // if filters are applied show also dataAll behind with low opacity
  if (controller.isYearFiltered == true) {
    svgAge.selectAll()
      .data(dataAll)
      .enter()
      .append('g')
      .append('rect')
      .attr('class', 'ageBars-back')
      .attr('x', (d) => xScaleAge(xValueAge(d)) - age_backOffset)
      .attr('y', (d) => yScaleAge(yValueAge(d)))
      .attr('height', (d) => height_ageChart - yScaleAge(yValueAge(d)))
      .attr('width', xScaleAge.bandwidth()/8)
      .style("fill",  (d) => colorScale(yValueAge(d)))
      .style("stroke", "black") 
      .attr('opacity', age_behindOpacity)
  } 


    // initialize bars and values
  const barGroups =  svgAge.selectAll('rect')
    .data(dataFiltered)

  const barValues = svgAge.selectAll('.bar-value-age')
    .data(dataFiltered)

  // add bars 
  barGroups
    .enter()
    .append('rect')
    .merge(barGroups)
    .on('mouseenter', mouseOver)
    .on('mouseleave', mouseLeave)
    .on('click', mouseClick) 
    .classed('ageBars-filtered', true)
    .transition()
    .duration(controller.transitionTime/2)
    .attr('x', (d) => xScaleAge(xValueAge(d)))
    .attr('y', (d) => yScaleAge(yValueAge(d)))
    .attr('height', (d) => height_ageChart - yScaleAge(yValueAge(d)))
    .attr('width', xScaleAge.bandwidth())
    .style("fill",  (d) => colorScale(yValueAge(d)))
    


  //add values on bars
  barValues 
    .enter()  
    .append('text')
    .merge(barValues)
    .attr('opacity', 0)
    .attr('class', 'bar-value-age')
    .attr('x', (d) => xScaleAge(xValueAge(d)) + xScaleAge.bandwidth() / 2)
    .attr('y', (d) => yScaleAge(yValueAge(d)) + 30)
    .attr('text-anchor', 'middle')
    .transition()
    .duration(controller.transitionTime)
    .text((d) => `${yValueAge(d)}`)
    .attr('opacity', 1)

  // add avg line
  printAvgY(svgAge, avg_value, avg_value_scaled, width_ageChart)

}



////////////////////////// HELP FUNCTIONS //////////////////////////

const updateAgeChart = () => {
  svgAge.selectAll('.ageBars-back').remove()
  svgAge.selectAll('.avg-line').remove()
  svgAge.selectAll('.avg-label').remove()
  makeAgeChart()
}


