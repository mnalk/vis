const makeLegend = () => {

    ////////////////////////// CALLBACK //////////////////////////

    const overLegend = function (d)  {
        d3.select(this)
            .style("cursor", "pointer")

        // get all countries with suicide/100k pop inside the interval
        const start = +this.attributes.class.value
        const end = +this.attributes.class.value + classesInterval 
        const countries = dataFiltered.filter(((d) => colorValueScatter(d) > start && colorValueScatter(d) < end))

        // make a string iterating on filtered countries
        let string = ''
        let count = 0
        countries.forEach((element, i) => {
            if (count < namesPerRowTooltip) {
                string += `${element.key}, `
                count = 0
            } else 
                string += `</br>`
            
            count += 1
        });
        string += `<b>#Countries:</b> ${countries.length}`
        
        // show tooltip
        tooltipLegend
            .style("opacity", 1)
            .html(string)
            .style("left", (d3.mouse(this)[0] + 40) + widthMap + "px")   
            .style("top", (d3.mouse(this)[1]) + 90 + "px") //heightMap + "px")


        if (controller.selectedCountries.length == 0) {
            // change opacity not over on scatter
            svgScatterPlot.selectAll('circle')
                .style('opacity', (d) => {
                    if (colorValueScatter(d) > start && colorValueScatter(d) < end)
                        return 1
                    else 
                        return opacityNotOver 
                })
            
            // change opacity not over on pca
            svgPca.selectAll('circle')
             .style('opacity', (d) => {
                 if (colorValuePca(d) > start && colorValuePca(d) < end)
                     return 1
                 else 
                     return opacityNotOver 
             })

            // change opacity not over on map
            map.selectAll('path')
                .style('opacity', (d) => {
                    if (d.total> start && d.total < end)
                        return 1
                    else 
                        return opacityNotOver 
                })
        }

    }    

    const leaveLegend = function (d) {	
        tooltipLegend
            .style("opacity", 0)

        if (controller.selectedCountries.length == 0) {
            svgScatterPlot.selectAll('circle')
                .style('opacity',  1)

            svgPca.selectAll('circle')
                .style('opacity',  1)
            
            map.selectAll('path')
                .style('opacity', 1)
        }
    }

    const labelSet = (d) => {
        if (d<81)
            return `${d} to ${(d+classesInterval)}`
        else
            return `80+`
    }

    const getMeanSize = function (d) {
        if (avg > d && avg < d+classesInterval) return scatter_circle_size*2
        else return scatter_circle_size + 1
    }

    const getMeanStroke = function (d) {
        if (avg > d && avg < d+classesInterval) return '#80cdc1'
        else return null
    }

    const getMeanWidth = function (d) {
        if (avg > d && avg < d+classesInterval) return 3
    }



    ////////////////////////// SETUP //////////////////////////

    // get data
    const keys = controller.colorKeys
    const colorScale = controller.colorScale;
    const dataFiltered = aggregateDataByCountry(controller.dataMapScatter);

    // compute avg colorscale
    const avg = Math.round((d3.sum(dataFiltered, (d) => colorValueScatter(d))) / dataFiltered.length *10) /10;



    ////////////////////////// CALL COMPONENTS //////////////////////////

    // svgLegend.append('text')
    //     .attr('class', 'axis-label')
    //     .attr("transform", `translate(${margin_legend.left}, 0)`) 
    //     .text(colorLabel)

    // Add one dot in the legend for each name.
    svgLegend.append('g')
        .attr("transform", `translate(${margin_legend.left+3}, 0)`) 
        .selectAll("mydots")
        .data(keys)
        .enter()
        .append("circle")
        .attr('class', (d) => d)
        .attr("cx", 10)
        .attr("cy", (d,i) =>  10 + i*26) 
        .attr("r", getMeanSize)
        .style("fill", (d) => colorScale(d))
        .style("stroke", getMeanStroke)
        .style("stroke-width", getMeanWidth)
        .on("mouseover", overLegend)
        .on("mouseout", leaveLegend)

        
    // Add one dot in the legend for each name.
    svgLegend.append('g')
        .attr("transform", `translate(${margin_legend.left+3}, 0)`) 
        .selectAll("mylabels")
        .data(keys)
        .enter()
        .append("text")
        .attr("text-anchor", "left")
        .style("alignment-baseline", "middle")
        .attr("x", 30)
        .attr("y", (d,i) => 15 + i*26) 
        .style("fill", 'white')
        .text(labelSet)

}


const updateLegend = () => {
    svgLegend.selectAll('text').remove()
    svgLegend.selectAll('circle').remove()
    makeLegend()
}