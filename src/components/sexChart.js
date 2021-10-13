const makeSexChart = () => {

  ////////////////////////// CALLBACK //////////////////////////

  // callback for mouseover bar
  const mouseOver = function (actual, i) {
    // check needed to avoid bug floating bars
    const nowSize = +this.attributes.y.value
    const finalSize = yScaleSex(this.__data__.value.suicides_pop)

    if (+nowSize == finalSize){
      // enlarge bar
      d3.select(this)
        .transition()
        .duration(sex_transition_time)
        .attr('x', (d) => xScaleSex(xValueSex(d)) - 5)
        .attr('width', xScaleSex.bandwidth() + 10)
        .style("cursor", "pointer");

      // show difference on bar insted of orignal value
      d3.selectAll('.bar-value-sex')  
        .text((d, idx) => {
          const divergence = (yValueSex(d) - actual.value.suicides_pop).toFixed(1)
          
          let text = ''
          if (divergence > 0) text += '+'
          text += `${divergence}`

          return idx !== i ? text : `${actual.value.suicides_pop}`;
        })
      }
  }


  // callback for mouseLeave bar
  const mouseLeave = function () {
    // check needed to avoid bug floating bars
    const nowSize = +this.attributes.y.value
    const finalSize = yScaleSex(this.__data__.value.suicides_pop)

    if (+nowSize == finalSize){
    // bar to normal size
    d3.select(this)
      .transition()
      .duration(sex_transition_time)
      .attr('x', (d) => xScaleSex(xValueSex(d)))
      .attr('width', xScaleSex.bandwidth())

    d3.selectAll('.bar-value-sex')  
      .text( (d) => yValueSex(d))
    }
  }


  // callback for mouseClick bar (with all countries shown)
  const mouseClick = function (e) {
    let selection = xValueSex(this.__data__)

    // toggle bar selection highlight
    if (d3.select(this).classed("selected-object") == false) {
      d3.selectAll('.sexBars-filtered').classed("selected-object", false) // so that the other get toggle
      d3.select(this).classed("selected-object", true)
    } else {
      d3.select(this).classed("selected-object", false);
      selection = 'All' // toggle agin => back to all
    }

    // trigger filter
    if (controller.selectedCountries == 0)  
      controller.triggerSexFilterEvent(selection);
    else 
      controller.triggerSexFilterEventWithSelectedMap(selection);

    // update avg line selected values with only this sex values
    selectedValuesAge = new Set();

    // for each selected bar, add the value inside the array
    arraySelectedBars = svgAge.selectAll('.selected-object')._groups[0]
    arraySelectedBars.forEach(element => {
      selectedValuesAge.add( yValueAge(element.__data__) )
    });

    // function inside helper
    updateAvgAgeBar()
  }



  ////////////////////////// SETUP //////////////////////////

  // get data
  const dataAll = aggregateDataBySex(controller.dataAll);
  const dataFiltered = aggregateDataBySex(controller.dataSex);
  const colorScale = controller.colorScale;

  // sort classes
  dataAll.sort((a, b) => d3.descending(a.key, b.key));
  dataFiltered.sort((a, b) => d3.descending(a.key, b.key));

  // compute padding on top yAxis (1/10 more than max between dataAll and dataFiltered)
  const max_val_year = d3.max(dataAll, yValueSex) 
  const max_val_filtered = d3.max(dataFiltered, yValueSex) 
  const max_val = (max_val_year >  max_val_filtered) ? max_val_year : max_val_filtered;
  const domain_max = parseInt(max_val) + parseInt(max_val/10) 

  // update axis domain
  xScaleSex.domain(dataAll.map(xValueSex))
  yScaleSex.domain([0, domain_max ])

  // axis setup
  const xAxis = d3.axisBottom(xScaleSex);
  const yAxis = d3.axisLeft(yScaleSex).tickFormat(AxisTickFormat);

  // compute avg line
  const avg_value = Math.round((d3.sum(dataFiltered, (d) => yValueSex(d))) / dataFiltered.length *10) /10;
  const avg_value_scaled = yScaleSex(avg_value)



  ////////////////////////// CALL COMPONENTS //////////////////////////

  // call X axis
  sexXAxisSvg.transition()
    .duration(controller.transitionTime/2)
    .call(xAxis)
    .selectAll("text")  
      .attr("class","axis-text");

  // call Y axis
  sexYAxisSvg.transition()
    .duration(controller.transitionTime/2)
    .call(yAxis)
    .selectAll("text")
      .attr("class","axis-text");

  // call Grid 
  sexYGridSvg.transition()
    .duration(controller.transitionTime/2)
    .call(d3.axisLeft()
      .scale(yScaleSex)
      .tickSize(-width_sexChart, 0, 0)
      .tickFormat(''))


  // if filters are applied show also dataAll behind with low opacity
  if (controller.isYearFiltered == true) {
    svgSex.selectAll()
      .data(dataAll)
      .enter()
      .append('g')
      .append('rect')
      .attr('class', 'sexBars-back')
      .attr('x', (d) => xScaleSex(xValueSex(d)) - sex_backOffset)
      .attr('y', (d) => yScaleSex(yValueSex(d)))
      .attr('height', (d) => height_sexChart - yScaleSex(yValueSex(d)))
      .attr('width', xScaleSex.bandwidth()/8)
      .style("fill",  (d) => colorScale(yValueSex(d)))
      .style("stroke", "black") 
      .attr('opacity', sex_behindOpacity)
  } 


  // initialize bars and values
  const barGroups =  svgSex.selectAll('rect')
    .data(dataFiltered)

  const barValues = svgSex.selectAll('.bar-value-sex')
    .data(dataFiltered)
    

  // add bars 
  barGroups
    .enter()
    .append('rect')
    .merge(barGroups)
    .on('mouseenter', mouseOver)
    .on('mouseleave', mouseLeave)
    .on('click', mouseClick) 
    .classed('sexBars-filtered', true)
    .transition()
    .duration(controller.transitionTime/2)
    .attr('x', (d) => xScaleSex(xValueSex(d)))
    .attr('y', (d) =>  yScaleSex(yValueSex(d)))
    .attr('height', (d) => height_sexChart - yScaleSex(yValueSex(d)))
    .attr('width', xScaleSex.bandwidth())
    .style("fill",  (d) => colorScale(yValueSex(d)))
    

  //add values on bars
  barValues 
    .enter()  
    .append('text')
    .merge(barValues)
    .attr('opacity', 0)
    .attr('class', 'bar-value-sex')
    .attr('x', (d) => xScaleSex(xValueSex(d)) + xScaleSex.bandwidth() / 2)
    .attr('y', (d) => yScaleSex(yValueSex(d)) + 30)
    .attr('text-anchor', 'middle')
    .transition()
    .duration(controller.transitionTime)
    .text((d) => `${yValueSex(d)}`)
    .attr('opacity', 1)


  // add avg line and label
  printAvgY(svgSex, avg_value, avg_value_scaled, width_sexChart)

}



////////////////////////// HELP FUNCTION //////////////////////////

const updateSexChart = () => {
  svgSex.selectAll('.sexBars-back').remove()
  svgSex.selectAll('.avg-line').remove()
  svgSex.selectAll('.avg-label').remove()
  makeSexChart()
}