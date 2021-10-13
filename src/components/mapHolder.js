const makeMap = () => {

  ////////////////////////// CALLBACK //////////////////////////

  // initial fill color for country
  const fillCountryColor = function (d) {
    if(typeof(data.get(nameMap(d))) === "undefined"){
      d.total = 'Missing data';
      return '#DCDCDC'; 
    }
    else{
      d.total = data.get(nameMap(d));
      return colorScale(d.total);
    }        
  }

  // callback for mouseover country
  const mouseOver = function (d) {
    const selectedCountries = controller.selectedCountries;

    d3.select(this)
      .style("fill", fillColorMap)
      .style("cursor", "pointer")
      .style('opacity', maxOpacity)
      .style("cursor", "pointer");
    
    // show tooltip
    tooltipMap
      .transition()
      .duration(controller.transitionTime)
    
    tooltipMap
      .style("opacity", 1)
      .html(
        '<b>Country:</b> ' + nameMap(d) + 
        '<br><b>Suicide ratio:</b> ' + totalMap(d))
      .style("left", (d3.mouse(this)[0]) + "px")   
      .style("top", (d3.mouse(this)[1]) + "px");

    // manage circles on scatterPlot
    const id = `#${nameMap(d)}`;
    d3.select('#scatterPlot')
      .select(id)
      .attr("r", scatter_selected_circle_size )
      .classed('over-object', true)

    // highlight circles on PCA
    d3.select('#pca')
      .selectAll(id)
      .attr("r", scatter_selected_circle_size )
      .classed('over-object', true)
  }

  // callback for mouseMove country
  const mouseMove = function (d) {
    tooltipMap
      .style("opacity", maxOpacity)
      .html(
        '<b>Country:</b> ' + nameMap(d) + 
        '<br><b>Suicide ratio:</b> ' + totalMap(d))
      .style("left", (d3.mouse(this)[0]) + "px")   
      .style("top", (d3.mouse(this)[1]) + "px");
  }

  // callback for mouseOut country
  const mouseOut = function(d){
    const selectedCountries = controller.selectedCountries;
    
    d3.select(this)
      .classed('over-object', false)
      .style("fill", (d)=>{
        if(controller.selectedCountries.length != 0){
          let flag = false;
          for(var i = 0; i<selectedCountries.length; i++){
            
            if(selectedCountries[i].id == this.id){
              flag = true;
            }  
          }          
          if(!flag){
            if(d.total === "Missing data") 
              return '#DCDCDC';
            else{
              d.total = data.get(nameMap(d));
              return colorScale(d.total);
            }
              
          }
          else{
            return svgRadar.select(`#${this.id}`).style('fill');
          }
        }
        else{
          if(d.total === "Missing data") 
              return '#DCDCDC';
            else{
              d.total = data.get(nameMap(d));
              return colorScale(d.total);
            }
        }
      })
      .style('opacity', () => {
        if(controller.selectedCountries.length != 0){
          let flag = false;

          for(var i = 0; i<selectedCountries.length; i++){
            
            if(selectedCountries[i].id == this.id)
              flag = true;
          }          
          if(!flag){
              return minOpacity;
          }
          else{
            return maxOpacity;
          }
        }
        else{
          return maxOpacity;
        }
      });

    tooltipMap
      .transition()
      .duration(250)
      .style("opacity", 0);

    // manage circles on scatterPlot
    const id = `#${nameMap(d)}`;
    d3.select('#scatterPlot')
      .select(id)
      .attr("r", scatter_circle_size )
      .classed('over-object', false)

    // remove highlight circles on PCA
    d3.select('#pca')
      .selectAll(id)
      .attr("r", scatter_circle_size )
      .classed('over-object', false)
  }

  // callback for mouseClick country
  const mouseClick = function(d){
    const selectedCountries = controller.selectedCountries;
        
    if(selectedCountries.includes(this)){
      const index = selectedCountries.indexOf(this);
      const newData = aggregateDataByCountry(controller.dataYear);
      d3.select(this)
        .style("stroke", 'transparent')
        .style('fill', (d) => {
          if(d.total === "Missing data"){
            return '#DCDCDC';
          }
          else{
            d.total = data.get(nameMap(d));
            return colorScale(d.total);
          }
        });

      if (index > -1) {
        selectedCountries.splice(index, 1);
      } 
      
      if(selectedCountries.length == 0){
        map
          .selectAll('path')
          .style('opacity', maxOpacity);
        controller.isCountryMapSelected = false;
      }
      if(firstAdded === this && selectedCountries.length != 0){
        firstAdded = selectedCountries[0];

        for(var i = 0; i<selectedCountries.length; i++){
          d3.select('#map-holder')
            .select(`#${selectedCountries[i].id}`)
            .style('stroke', strokeColorMap)
            .style('opacity', maxOpacity);
        };
      }
    }
    else{
      if(selectedCountries.length < maxSelectCountries){
        if(selectedCountries.length == 0){
          firstAdded = this;
          map
            .selectAll('path')
            .style('opacity', minOpacity);
        }
        selectedCountries.push(this);
      }
      else{
        const index = selectedCountries.indexOf(firstAdded);
        if (index > -1) {
          selectedCountries.splice(index, 1);
        }

        d3.select('#map-holder')
          .select(`#${firstAdded.id}`)
          .style('stroke', 'transparent')
          .style('fill', (d) => {
            if(d.total === "Missing data"){
              return '#DCDCDC';
            }
            else{
              d.total = data.get(nameMap(d));
              return colorScale(d.total);
            }
          })
          .style('opacity', minOpacity);

        firstAdded = selectedCountries[0];

        selectedCountries.push(this);
      }          
      controller.isCountryMapSelected = true;
      
      if(selectedCountries.length === 1){
        const newData = aggregateDataByCountry(controller.dataYear);
        for( let j = 0; j<newData.length; j++){
          data.set(newData[j].key, +newData[j].value.suicides_pop);
         
          d3.select('#map-holder')
          .select(`#${newData[j].key}`) //+ newData[j].key)
          .style('stroke', 'transparent')
          .style('fill', (d) => {
            if(newData[j].value.suicides_pop === "Missing data"){
              return '#DCDCDC';
            }
            else{
              d.total = data.get(nameMap(d));
              return colorScale(d.total);
            }
          })
          .style('opacity', minOpacity);
        }
        //console.log(data);
      }

      for(var i = 0; i<selectedCountries.length; i++){
        d3.select('#map-holder')
          .select(`#${selectedCountries[i].id}`)
          .style('stroke', strokeColorMap)
          .style('opacity', maxOpacity);
      };

    } 

    
    // trigger filter and draw Radar + Linechart 
    let selectedPoints = [];
    if (selectedCountries.length > 0) 
      selectedCountries.forEach((country) => selectedPoints.push({key: country.id} ));
    else 
      selectedPoints = aggregateDataByCountry(controller.dataYear); // if empty (deselect everythng) go back to all countries
    
    controller.triggerMapFilterEvent(selectedPoints);

    // from radar-line to scatter-pca and back
    switchVisualizationSet()
  }



  ////////////////////////// SETUP //////////////////////////

  // get data
  //const dataYear = aggregateDataByCountryRadar(controller.dataYear);
  const dataFiltered = aggregateDataByCountry(controller.dataMapScatter);
  const colorScale = controller.colorScale;

  // extract values for colorScale
  const data = d3.map();
  for (var i = 0; i<dataFiltered.length; i++){
    data.set(dataFiltered[i].key, +dataFiltered[i].value.suicides_pop);
  }   
  //console.log(data);

  // add zoom
  d3.select('#map-holder').call(zoomMap);

  ////////////////////////// INITIALIZE MAP //////////////////////////

  d3.json(geoJsonUrl, function(json) {

    // Draw the map
    map.append("g")
      .selectAll("path")
      .data(json.features)
      .enter()
      .append("path")
      // draw each country
      .attr("d", d3.geoPath()
        .projection(projection)
      )
      .attr("fill", fillCountryColor)
      .style("stroke", "transparent")
      .attr("id", (d) => nameMap(d))
      .attr("class", "Country")
      .style("opacity", maxOpacity)
      .on("mouseover", mouseOver)
      .on("mousemove", mouseMove)
      .on("mouseout", mouseOut)
      .on("click", mouseClick);

  });   
}


////////////////////////// HELP FUNCTIONS //////////////////////////

function updateMap() {
  map.selectAll('g')
  .remove()
  .exit();

  d3.select('#map-holder')
  .selectAll('tooltipMap-scatter')
  .remove()
  .exit();

  makeMap()  
}