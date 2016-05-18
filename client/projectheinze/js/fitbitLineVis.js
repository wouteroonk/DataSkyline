// Define the CircleVis constructor
function FitbitLineVis(svg, url) {
      // Call the parent constructor, making sure (using Function#call)
      // that "this" is set correctly during the call
  FitbitBaseVis.call(this, svg, url);

}

// Create a CircleVis.prototype object that inherits from VisObject.prototype.
// Note: A common error here is to use "new VisObject()" to create the
// CircleVis.prototype. That's incorrect for several reasons, not least 
// that we don't have anything to give VisObject for the "firstName" 
// argument. The correct place to call VisObject is above, where we call 
// it from CircleVis.
FitbitLineVis.prototype = Object.create(FitbitBaseVis.prototype); // See note below

// Set the "constructor" property to refer to CircleVis
FitbitLineVis.prototype.constructor = FitbitLineVis;

    // Replace the "sayHello" method
FitbitLineVis.prototype.drawGraph = function(){
   
    var Vis = this;
    
    // Set the dimensions of the canvas / graph
    var margin = {top: 20, right: 200, bottom: 30, left: 50},
    width = this.canvasWidth - margin.left - margin.right,
    height = this.canvasHeight - margin.top - margin.bottom;

    var parseDate = d3.time.format("%H:%M:%S").parse;

    var x = d3.time.scale()
        .range([0, width]);

    var y = d3.scale.linear()
        .range([height, 0]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left");



    var svg = this.canvas
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      var listX = [];  
      var listY = [];
      Vis.data.forEach(function(d) {
          d.time = parseDate(d.time);
          d.name = "hartslag";
        listY.push(d.value);
          listX.push(d.time);
      });
        
      
      x.domain(d3.extent(Vis.data, function(d) { return d.time; }));
    
      
      y.domain([d3.min(listY),d3.max(listY)]);
    
    console.log(y(this.data[1].value));
        console.log(x(this.data[1].time));
        
    var line = d3.svg.line()
    .x(function(d) { console.log("haha");return x(d.time); })
    .y(function(d) { return y(d.value); });
    
    
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
          .text("Hartslag");

      var city = svg.selectAll(".city")
          .data(this.data)
        .enter().append("g")
          .attr("class", "city");

      svg.append("path")
          .attr("class", "dataline")
          .attr("d", function() {  console.log("blaat"); return line(Vis.data); })
          .style("stroke", "#5c5aa8");
    
//    console.log(this.data);
//    console.log("all good");
    
    
};


