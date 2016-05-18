// Define the CircleVis constructor
function SpreadsheetLineVis(svg, url) {
      // Call the parent constructor, making sure (using Function#call)
      // that "this" is set correctly during the call
  SpreadsheetVis.call(this, svg, url);

}

// Create a CircleVis.prototype object that inherits from VisObject.prototype.
// Note: A common error here is to use "new VisObject()" to create the
// CircleVis.prototype. That's incorrect for several reasons, not least 
// that we don't have anything to give VisObject for the "firstName" 
// argument. The correct place to call VisObject is above, where we call 
// it from CircleVis.
SpreadsheetLineVis.prototype = Object.create(SpreadsheetVis.prototype); // See note below

// Set the "constructor" property to refer to CircleVis
SpreadsheetLineVis.prototype.constructor = SpreadsheetLineVis;

    // Replace the "sayHello" method
SpreadsheetLineVis.prototype.drawGraph = function(){
   
    var data = this.data.pagelikes.elements;
    
    // Set the dimensions of the canvas / graph
    var margin = {top: 20, right: 200, bottom: 30, left: 80},
    width = this.canvasWidth - margin.left - margin.right,
    height = this.canvasHeight - margin.top - margin.bottom;

    var parseDate = d3.time.format("%d-%m-%Y").parse;

    var x = d3.time.scale()
        .range([0, width]);

    var y = d3.scale.linear()
        .range([height, 0]);
    
    
    var index = Math.floor(Math.random()*d3.keys(data[0]).length);
    if(index ==0 ){ index = 1};
    var active = d3.keys(data[0])[index];
    console.log(active);
    
    var color = d3.scale.ordinal()
                .domain(d3.keys(data[0])
                .filter(function(key) { return key !== "date"; }))
                .range(["#06bdea","#9bb717","#ed1e68","#ff912b","#5c4fd9"]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left");

    var line = d3.svg.line()
        .interpolate("basis")
        .x(function(d) { return x(d.date); })
        .y(function(d) { return y(d.temperature); });

    var svg = this.canvas
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var keys = d3.keys(data[0])
      data.forEach(function(d) {
          d.date = parseDate(d.date);
    
        for(var i =0;i<keys.length;i++){
            if(keys[i]!=="date"){
                d[keys[i]]  = parseFloat(d[keys[i]].replace(".",",")); 
            }
        }
          
      });
        
    
      var cities = color.domain().map(function(name) {
        return {
          name: name,
          values: data.map(function(d) {
            return {date: d.date, temperature: +d[name]};
          })
        };
      });
    var newCities = [];
        
    for(var i=0;i<cities.length;i++){
        if(cities[i].name == active){
            newCities.push(cities[i]);
        }
    }
    cities =newCities;
    x.domain(d3.extent(data, function(d) { return d.date; }));

      y.domain([
        d3.min(cities, function(c) { return d3.min(c.values, function(v) { return v.temperature; }); }),
        d3.max(cities, function(c) { return d3.max(c.values, function(v) { return v.temperature; }); })
      ]);

      svg.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + height + ")")
          .call(xAxis);

      svg.append("g")
          .attr("class", "y axis")
          .call(yAxis)
        .append("text")
          .attr("transform", "rotate(-90)")
          .attr("y", 6)
          .attr("dy", ".71em")
          .style("text-anchor", "end")
          .text("Pagelikes");

      var city = svg.selectAll(".city")
          .data(cities)
        .enter().append("g")
          .attr("class", "city");

      city.append("path")
          .attr("class", "dataline")
          .attr("d", function(d) { return line(d.values); })
          .style("stroke", function(d) { return color(d.name); });

      city.append("text")
          .attr("class","labels")
          .datum(function(d) { return {name: d.name, value: d.values[d.values.length - 1]}; })
          .attr("transform", function(d) { return "translate(" + x(d.value.date) + "," + y(d.value.temperature) + ")"; })
          .attr("x", 3)
          .attr("dy", ".35em")
          .text(function(d) { return d.name; });
    
};


