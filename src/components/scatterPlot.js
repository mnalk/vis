const makeScatterPlot = () => {

    ////////////////////////// CALLBACK //////////////////////////

    // callback for mouseover circles 
    const onPoint = function (d) {
        // highlight circle
        d3.select(this)
            .style("cursor", "pointer")
            .attr("r", scatter_selected_circle_size )
            .classed('over-object', true)
    
        // highlight state on map
        d3.select('#map-holder').select('#'+countryScatter(d))
            .classed('over-object', true)
            .style("fill", "lightblue");

        // highlight circles on PCA
        d3.select('#pca')
            .selectAll('#'+countryScatter(d))
            .attr("r", scatter_selected_circle_size )
            .classed('over-object', true)
        
        const gdp_year = d3.format('.2s')(xValueScatter(d)).replace('G', 'B');
        const gdp_capita = d3.format('.2s')(yValueScatter(d)).replace('G', 'B');  
        
        tooltipScatter
            .transition()
            .duration(controller.transitionTime/2)
        
        // show tooltip
        tooltipScatter
            .style("opacity", 1)
            .html(
                '<b>Country:</b> ' + countryScatter(d) + 
                `<br><b>GDP for year ${avg_show_scatter}: </b> ${gdp_year}` + 
                `<br><b>Gdp per capita ${avg_show_scatter}: </b> ${gdp_capita}` + 
                `<br><b>Suicide ratio:</b> ${d.value.suicides_pop}`)
            .style("left", (d3.mouse(this)[0]+30) + widthMap + initial_width_legend + "px")    
            .style("top", (d3.mouse(this)[1]) + heightMap + "px") //heightMap + "px")
    }

    // callback for mousemove circles 
    const moveOverPoint = function (d) {
        const gdp_year = d3.format('.2s')(xValueScatter(d)).replace('G', 'B');
        const gdp_capita = d3.format('.2s')(yValueScatter(d)).replace('G', 'B');
        
        // show tooltip
        tooltipScatter
            .style("opacity", 1)
            .html(
                '<b>Country:</b> ' + countryScatter(d) + 
                `<br><b>GDP for year ${avg_show_scatter}: </b> ${gdp_year}` + 
                `<br><b>Gdp per capita ${avg_show_scatter}: </b> ${gdp_capita}` + 
                `<br><b>Suicide ratio:</b> ${d.value.suicides_pop}`)
            .style("left", (d3.mouse(this)[0]+30) + widthMap + initial_width_legend + "px")   
            .style("top", (d3.mouse(this)[1]) +  heightMap + "px") //heightMap + "px")
    }
    
    // callback for mouseleave circles 
    const leavePoint = function(d){	
        // remove highlight circle
        d3.select(this)
            .attr("r", scatter_circle_size )
            .classed('over-object', false)
    
        // remove highlight state on map
        d3.select('#map-holder').select('#'+countryScatter(d))
            .style("stroke", "transparent")
            .style("fill", (d)=>{
                if(d.total === "Missing data") 
                    return '#DCDCDC';
                else{
                    return colorScale(d.total);
                }
            });

        // remove highlight circles on PCA
        d3.select('#pca')
            .selectAll('#'+countryScatter(d))
            .attr("r", scatter_circle_size )
            .classed('over-object', false)
    
        tooltipScatter
            .style("opacity", 0)
    }


    // brush callback
    const updateOnBrush = () => {
        
        extent = d3.event.selection
        selectedPoints = []; // here we will have all the points in the selected region (or all the original points)

        // If no selection, back to initial coordinate. Otherwise, update domain
        if (!extent) {
            if (!idleTimeout) return idleTimeout = setTimeout(idled, 350);

            // update axis scale
            xScaleScatter.domain([0, domain_max_x ])
            yScaleScatter.domain([0, domain_max_y ])

            // back to all the original points for this year
            selectedPoints = aggregateDataByCountry(controller.dataYear);
            
            // update filter
            controller.isScatterFilteredByBars = false;
            controller.isScatterFiltered = false;
            controller.triggerScatterFilterEvent(selectedPoints);

            // remake scatter to get all data
            updateScatter();

        } else {  
            // get back values in correct scale
            const x0 = xScaleScatter.invert(extent[0][0])
            const x1 = xScaleScatter.invert(extent[1][0])
            const y0 = yScaleScatter.invert(extent[1][1])
            const y1 = yScaleScatter.invert(extent[0][1])

            // update axis domain
            xScaleScatter.domain([ x0, x1 ])
            yScaleScatter.domain([ y0, y1 ])

            // get all the points in the region        
            dataFiltered.forEach(( point ) => {
                if (xValueScatter(point) > x0 && xValueScatter(point) < x1 && yValueScatter(point) > y0 && yValueScatter(point) < y1) 
                    selectedPoints.push(point);
            })

            // update filter
            controller.isScatterFiltered = true;
            controller.triggerScatterFilterEvent(selectedPoints);

            // from here update all components
            // to remove the grey brush area as soon as the selection has been done
            scatterArea.select(".brush").call(scatterBrush.move, null) 

            // update axis 
            scatterXAxisSvg.transition().duration(1000).call(xAxis)
                .selectAll("text") 
                    .attr("class","axis-text");

            scatterYAxisSvg.transition().duration(1000).call(yAxis)
                .selectAll("text") 
                    .attr("class","axis-text");

            // update grid
            scatterXGridSvg
                .transition()
                .duration(controller.transitionTime)
                //.attr('transform', `translate(0, ${height_scatterPlot})`)
                .call(d3.axisBottom()
                    .scale(xScaleScatter)
                    .tickSize(-height_scatterPlot, 0, 0)
                    .tickFormat(''))

            scatterYGridSvg 
                .transition()
                .duration(controller.transitionTime)
                .call(d3.axisLeft()
                    .scale(yScaleScatter)
                    .tickSize(-width_scatterPlot, 0, 0)
                    .tickFormat(''))
                
            // update circles position
            scatterArea
                .selectAll("circle")
                .transition()
                .duration(controller.transitionTime)
                .attr("cx", (d) => xScaleScatter(xValueScatter(d)))
                .attr("cy", (d) => yScaleScatter(yValueScatter(d)))
                .attr("r", scatter_circle_size)
                .delay( (d,i) => i*5)

            // update position avg lines (values need rescale)
            const avg_value_scaled_y = yScaleScatter(avg_value_y)
            const avg_value_scaled_x = xScaleScatter(avg_value_x)
            svgScatterPlot.selectAll('.avg-line').remove()
            svgScatterPlot.selectAll('.avg-label').remove()
            printAvgY(svgScatterPlot, avg_value_y, avg_value_scaled_y, width_scatterPlot)
            printAvgX(svgScatterPlot, avg_value_x, avg_value_scaled_x, height_scatterPlot)

            // compute avg selected line for y
            // const avg_value_y_selected = Math.round((d3.sum(selectedPoints, (d) => xValueScatter(d))) / selectedPoints.length *10) /10;
            // const avg_value_scaled_y_selected = xScaleScatter(avg_value_y_selected)

            // // compute avg selected line for x
            // const avg_value_x_selected = Math.round((d3.sum(selectedPoints, (d) => xValueScatter(d))) / selectedPoints.length *10) /10;
            // const avg_value_scaled_x_selected = xScaleScatter(avg_value_x_selected)

            // // add selection avg bar
            // svgScatterPlot.selectAll('.avg-line-selected').remove()
            // svgScatterPlot.selectAll('.avg-label-selected').remove()
            // printAvgYonSelection(svgScatterPlot, avg_value_y_selected, avg_value_scaled_y_selected, width_scatterPlot)
            // printAvgXonSelection(svgScatterPlot, avg_value_x_selected, avg_value_scaled_x_selected, height_scatterPlot)

        }

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
    const dataAll = aggregateDataByCountry(controller.dataYear);
    const dataFiltered = aggregateDataByCountry(controller.dataMapScatter);
    const colorScale = controller.colorScale;

    // compute axis domain (max+padding if back to full, only selected extent if filtered by bars)
    let domain_min_x = 0;
    let domain_min_y = 0
    
    if (controller.isScatterFilteredByBars == true) {
        // add some padding on top xAxis (1/10 more than max between dataAll and dataFiltered)
        const min_val_filtered_x = d3.min(dataFiltered, xValueScatter) 
        domain_min_x = parseInt(min_val_filtered_x) - parseInt(min_val_filtered_x/10)

        // add some padding on top yAxis (1/10 more than max between dataAll and dataFiltered)
        const min_val_filtered_y = d3.min(dataFiltered, yValueScatter) 
        domain_min_y = parseInt(min_val_filtered_y) - parseInt(min_val_filtered_y/10)
    } 

    // add some padding on top xAxis (1/10 more than max between dataAll and dataFiltered)
    const max_val_filtered_x = d3.max(dataFiltered, xValueScatter) 
    const domain_max_x = parseInt(max_val_filtered_x) + parseInt(max_val_filtered_x/10)

    // add some padding on top yAxis (1/10 more than max between dataAll and dataFiltered)
    const max_val_filtered_y = d3.max(dataFiltered, yValueScatter) 
    const domain_max_y = parseInt(max_val_filtered_y) + parseInt(max_val_filtered_y/10)

    // set axis domain
    xScaleScatter.domain([domain_min_x, domain_max_x ])
    yScaleScatter.domain([domain_min_y, domain_max_y ])



    // axis setup
    const xAxis = d3.axisBottom(xScaleScatter).tickFormat(AxisTickFormat);
    const yAxis = d3.axisLeft(yScaleScatter).tickFormat(AxisTickFormat);

    // compute avg line for y
    const avg_value_y = Math.round((d3.sum(dataAll, (d) => yValueScatter(d))) / dataAll.length *10) /10;
    const avg_value_scaled_y = yScaleScatter(avg_value_y)

    // compute avg line for x
    const avg_value_x = Math.round((d3.sum(dataAll, (d) => xValueScatter(d))) / dataAll.length *10) /10;
    const avg_value_scaled_x = xScaleScatter(avg_value_x)
        
    // initialize brushing
    scatterBrush.on("end", updateOnBrush) 

    // if no filter applied then show avg in tooltip
    let avg_show_scatter = " (avg.)"
    if (controller.isYearFiltered == true) 
        avg_show_scatter = ""



    ////////////////////////// CALL COMPONENTS //////////////////////////

    // call x Axis
    scatterXAxisSvg.transition()
        .duration(controller.transitionTime/2)
        .call(xAxis)
            .selectAll("text")  //text color
                .attr("class","axis-text");

    // call Y axis
    scatterYAxisSvg.transition()
        .duration(controller.transitionTime/2)
        .call(yAxis)
        .selectAll("text")
            .attr("class","axis-text");

            
    // call Grid veritcal
    scatterXGridSvg
        .transition()
        .duration(controller.transitionTime/2)
        .attr('transform', `translate(0, ${height_scatterPlot})`)
        .call(d3.axisBottom()
            .scale(xScaleScatter)
            .tickSize(-height_scatterPlot, 0, 0)
            .tickFormat(''))

    // call Grid oriziontal
    scatterYGridSvg 
        .transition()
        .duration(controller.transitionTime/2)
        .call(d3.axisLeft()
            .scale(yScaleScatter)
            .tickSize(-width_scatterPlot, 0, 0)
            .tickFormat(''))

    
    // add circles
    scatterCircles = scatterArea.append('g')
        .selectAll("circle")
        .data(dataFiltered)

    scatterCircles
        .enter()
        .append("circle")
        //.merge(scatterCircles)
            .on("mouseover", onPoint)
            .on("mousemove", moveOverPoint)
            .on("mouseout", leavePoint)
            .attr('class', 'scatter-points') 
            .attr('id', (d) => countryScatter(d))
            .style("fill", (d) => colorScale(colorValueScatter(d)))
            .style("opacity", 1)
            .transition()
            .duration(0)    // needed for delay
            .attr("cx", (d) => xScaleScatter(xValueScatter(d)))
            .attr("cy", (d) => yScaleScatter(yValueScatter(d)))
            .attr("r", scatter_circle_size)
            .delay( (d,i) => (i*scatter_points_delay))
          
            
    // add avg lines
    printAvgY(svgScatterPlot, avg_value_y, avg_value_scaled_y, width_scatterPlot)
    printAvgX(svgScatterPlot, avg_value_x, avg_value_scaled_x, height_scatterPlot)

}



////////////////////////// HELP FUNCTIONS //////////////////////////

// toggle brush when press button
const toggleBrush = () => {
    if (scatter_toggle_brush == false) {
        // add brushing
        scatterArea
            .append("g")
                .attr("class", "brush")
                .call(scatterBrush);
        d3.select('#button-brush').classed('toggle-brush', true)

    } else {
        svgScatterPlot.select('.brush').remove()
        d3.select('#button-brush').classed('toggle-brush', false)
    }

    scatter_toggle_brush = !scatter_toggle_brush;
}



// update data on year changed
const updateScatter = () => {
    svgScatterPlot.selectAll('.scatter-points').remove()
    svgScatterPlot.selectAll('.avg-line').remove()
    svgScatterPlot.selectAll('.avg-label').remove()
    makeScatterPlot();
};




