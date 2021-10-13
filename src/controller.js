Controller = function () {
    // events handlers
    this.isYearFiltered = false;            // need for back-bars
    this.isCountryMapSelected = false;      // true when at least one country on the map is selected
    this.isScatterFiltered = false;         // needed to avoid scatter go back when bar filtered
    this.isScatterFilteredByBars = false    // set to true when bars filtered, back to false on brush back to full size
    
    // applied filters
    this.selectedCountries = [];            // max three selected countries
    this.scatterFilter = null;              // scatter filters currently selected
    this.sexFilter = 'All';                 // sexBar filters currently selected
    this.ageFilter = new Set();             // ageBar filters currently selected

    // data with different filters, one for each visualization
    this.dataAll;
    this.dataYear;
    this.dataMapScatter;
    this.dataSex;
    this.dataAge;
    this.dataLineChart;
    this.countryNames;

    // global static values
    this.colorKeys = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90]
    this.colorScale = ['#ffffcc','#ffeda0','#fed976','#feb24c','#fd8d3c','#fc4e2a','#e31a1c','#bd0026','#800026'];  //all color scales from https://colorbrewer2.org/
    this.transitionTime = 1000;
}


Controller.prototype.loadData = function () {
    _obj = this;

    d3.csv("../data/data.csv", parseRow, function (data) {
        //console.log("data loading...")   

        countries = new Set();
        data.forEach(d => {
            countries.add(d.country)      
        });

        // save data 
        _obj.dataAll = data;
        _obj.dataYear = data;
        _obj.dataMapScatter = data;
        _obj.dataSex = data;
        _obj.dataAge = data;
        _obj.dataLineChart = data;
        _obj.countryNames = countries;

        //console.log(data)

        // set suicide colorScale
        // const colorValueScale = d => d.suicides_pop;
        _obj.colorScale = d3.scaleQuantile()
            .domain(_obj.colorKeys)
            .range(_obj.colorScale)

        // draw graphs
        makeMap();
        makeLegend();
        makePca();
        makeScatterPlot();  
        makeSexChart();
        makeAgeChart();
    });
}



////////////////////////// COMPONENTS UPDATE //////////////////////////

Controller.prototype.notifyYearFiltered = function () {
    //console.log('year changed!')  // needs complete reload
    updateLegend()
    updateMap() 
    updateSexChart()
    updateAgeChart() 
    updateScatter()
    updatePca();
}

Controller.prototype.notifyMapFiltered = function () {
    //console.log('Map filtered!')  // needs complete reload
    updateLegend()
    updateSexChart()
    updateAgeChart() 
    makeLineChart(); 
    drawRadar();

    // to reduce the computation time when i select countries
    if (this.isCountryMapSelected == false){
        updateScatter();
        updatePca();
    }    
}

Controller.prototype.notifyScatterFiltered = function () {
    //console.log('Scatter filtered!')
    updateLegend()
    updateMap()
    updateSexChart()
    updateAgeChart() 
    updatePca();
}


// used only when no selected countries
Controller.prototype.notifySexFiltered = function () {
    //console.log('sex filtered!')
    updateLegend()
    updateMap() 
    updateAgeChart() 
    updateScatter()
    updatePca();
    this.isScatterFilteredByBars = true; 
}

// used only when no selected countries
Controller.prototype.notifyAgeFiltered = function () {
    //console.log('age filtered!')
    updateLegend()
    updateMap() 
    updateSexChart()
    updateScatter()
    updatePca();
    this.isScatterFilteredByBars = true; 
}

// used only when at least one selected countries
Controller.prototype.notifySexFilteredWithSelectedMap = function () {   
    //console.log('sex filtered!')
    updateAgeChart()
    makeLineChart() 
    drawRadar()
    this.isScatterFilteredByBars = true; 
}

// used only when at least one selected countries
Controller.prototype.notifyAgeFilteredWithSelectedMap = function () { 
    //console.log('age filtered!')
    updateSexChart()
    makeLineChart() 
    drawRadar()  
    this.isScatterFilteredByBars = true; 
}




////////////////////////// TRIGGER FILTERS //////////////////////////

// filter by year
Controller.prototype.triggerYearFilterEvent = function (selectedYear) {   
    // to remove all selections on bars
    d3.selectAll(".selected-object").classed("selected-object", false)
    svgAge.selectAll('.avg-line-selected').remove()
    svgAge.selectAll('.avg-label-selected').remove()

    // radar and lineChart are replaced by scatter and pca
    this.selectedCountries = [];
    switchVisualizationSet();

    // set all filters to initial status
    this.selectedCountries = [];            
    this.scatterFilter = null;
    this.sexFilter = 'All';
    this.ageFilter = new Set();
    selectedBarsAge = new Set();
    selectedValuesAge = new Set();
    
    this.yearFilter(selectedYear);
    this.notifyYearFiltered();
}


// filter by map
Controller.prototype.triggerMapFilterEvent = function (selectedPoints) {
    // to remove all selections on bars
    d3.selectAll(".selected-object").classed("selected-object", false)
    svgAge.selectAll('.avg-line-selected').remove()
    svgAge.selectAll('.avg-label-selected').remove()

    // put bar filters to initial status
    this.sexFilter = 'All';
    this.ageFilter = new Set();
    selectedBarsAge = new Set();
    selectedValuesAge = new Set();

    this.scatterFilter = selectedPoints;
    this.globalFilter();
    this.lineChartFilter();
    this.notifyMapFiltered();
}


// filter by scatter
Controller.prototype.triggerScatterFilterEvent = function (selectedPoints) {
    this.scatterFilter = selectedPoints;
    this.globalFilter();
    this.notifyScatterFiltered();
}

// filter by sex
Controller.prototype.triggerSexFilterEvent = function (selectedSex) {
    this.sexFilter = selectedSex;
    this.globalFilter();
    this.notifySexFiltered();
}

// filter by age
Controller.prototype.triggerAgeFilterEvent = function (selectedAge) {
    this.ageFilter = selectedAge;
    this.globalFilter();
    this.notifyAgeFiltered();
}


// filter by sex when map selected
Controller.prototype.triggerSexFilterEventWithSelectedMap = function (selectedSex) {
    this.sexFilter = selectedSex;
    this.globalFilter();
    this.lineChartFilter(); // linechart takes data from all the years!
    this.notifySexFilteredWithSelectedMap();
}

// filter by age when map selected
Controller.prototype.triggerAgeFilterEventWithSelectedMap = function (selectedAge) {
    this.ageFilter = selectedAge;
    this.globalFilter();
    this.lineChartFilter(); // linechart takes data from all the years!
    this.notifyAgeFilteredWithSelectedMap();
}




////////////////////////// COMPUTE FILTERS //////////////////////////

// global filter (back to all, or get only selected year data)
Controller.prototype.yearFilter = function (selectedYear) {
    if (isNaN(selectedYear)==true) {
        // reset all data
        this.dataYear = this.dataAll;
        this.dataMapScatter = this.dataAll;
        this.dataSex = this.dataAll;
        this.dataAge = this.dataAll;
        this.isYearFiltered = false;  

    } else {
        dataFiltered = this.dataAll.filter((d) => d.year==selectedYear); 
        this.dataYear = dataFiltered;
        this.dataMapScatter = dataFiltered;
        this.dataSex = dataFiltered;
        this.dataAge = dataFiltered
        this.isYearFiltered = true; 
    }
    
}



// global filter 
Controller.prototype.globalFilter = function () {
    // initialize data for each visualization
    let dataMapScatter = this.dataYear;
    let dataSex = this.dataYear;
    let dataAge = this.dataYear;

    // console.log(this.sexFilter)
    // console.log(this.ageFilter)
    // console.log(this.scatterFilter)
    // console.log(this.isScatterFiltered)
    

    // filter scatter
    const scatterFilterArray = this.scatterFilter;
    if (scatterFilterArray != null) {
        
        let tmpData = []
        // for each age selected take all corresponding data d
        scatterFilterArray.forEach((scatterFilter) => {
            dataMapScatter.forEach(d => {
                if (d.country==scatterFilter.key) tmpData.push(d);
            });
        })

        if (this.isScatterFiltered == true)
            dataMapScatter = tmpData;  // no need update
        dataAge = tmpData;
        dataSex = tmpData;
        //console.log(dataMapScatter)
    }
    

    // filter sex  (that is boolean) (not for dataSex)
    const sexFilter = this.sexFilter
    if (sexFilter != 'All') {
        dataMapScatter = dataMapScatter.filter((d) => d.sex==sexFilter);
        dataAge = dataAge.filter((d) => d.sex==sexFilter);
        // dataSex = dataSex;    // do not delete other sex data!!
    }


    // filter age (not for dataAge)
    const ageFilterArray = this.ageFilter;
    if (ageFilterArray.size > 0) {

        let tmpDataMapScatter = []
        let tmpDataSex = []
        // for each age selected take all corresponding data d
        ageFilterArray.forEach((ageFilter) => {
            dataMapScatter.forEach(d => {     
                if (d.age==ageFilter) tmpDataMapScatter.push(d);
            });

            dataSex.forEach(d => {          
                if (d.age==ageFilter) tmpDataSex.push(d);
            });
        })
        
        dataMapScatter = tmpDataMapScatter;
        dataSex = tmpDataSex;
        //dataAge = already updated sex    // do not delete other age data!!
    }

    // update values
    this.dataMapScatter = dataMapScatter;
    this.dataSex = dataSex;
    this.dataAge = dataAge;
}



// line chart filter (data on more years)
Controller.prototype.lineChartFilter = function () {
    // initialize data for each visualization
    let dataLineChart =  this.dataAll;

    // filter sex  (that is boolean) (not for dataSex)
    const sexFilter = this.sexFilter
    if (sexFilter != 'All') {
        dataLineChart = dataLineChart.filter((d) => d.sex==sexFilter);
    }


    // filter age (not for dataAge)
    const ageFilterArray = this.ageFilter;
    if (ageFilterArray.size > 0) {

        let tmpData = []
        // for each age selected take all corresponding data d
        ageFilterArray.forEach((ageFilter) => {
            dataLineChart.forEach(d => {     
                if (d.age==ageFilter) tmpData.push(d);
            });
        })
        
        dataLineChart = tmpData;
    }

    // update values
    this.dataLineChart = dataLineChart;
}



////////////////////////// INITIALIZE //////////////////////////

const controller = new Controller();
controller.loadData();
