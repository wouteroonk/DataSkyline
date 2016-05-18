// Define the CircleVis constructor
function SpreadsheetPiechart(svg, url) {
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
SpreadsheetPiechart.prototype = Object.create(SpreadsheetVis.prototype); // See note below

// Set the "constructor" property to refer to CircleVis
SpreadsheetPiechart.prototype.constructor = SpreadsheetPiechart;

    // Replace the "sayHello" method
SpreadsheetPiechart.prototype.drawGraph = function(){
   
    var Vis = this;
   //TODO: custom keys!
    var data = this.data.tracks.elements;
    var radius = Math.min(this.canvasWidth+25, this.canvasHeight+25) / 2;
    // Set the dimensions of the canvas / graph
    var margin = {top: -20, right: -20, bottom: -20, left: -20},
    width = this.canvasWidth - margin.left - margin.right,
    height = this.canvasHeight - margin.top - margin.bottom;
    
    var cList = [];
    $.each(data,function(index,value){
        cList.push(data[index]["type"]);
    });
    
    var color = d3.scale.ordinal()
                .domain(cList
                .filter(function(key) { return key !== "date"; }))
                .range(["#06bdea","#9bb717","#ed1e68","#ff912b","#5c4fd9"]);
   
    var arc = d3.svg.arc()
    .outerRadius(radius - 10)
    .innerRadius(0);

    var labelArc = d3.svg.arc()
        .outerRadius(radius - 80)
        .innerRadius(radius - 80);

    var pie = d3.layout.pie()
        .sort(null)
        .value(function(d) { return d.value; });

    var svg = Vis.canvas
      .append("g")
        .attr("transform", "translate(" + this.canvasWidth / 2 + "," + this.canvasHeight / 2 + ")");
  
      var g = svg.selectAll(".arc")
          .data(pie(data))
        .enter().append("g")
          .attr("class", "arc");

      g.append("path")
          .attr("d", arc)
          .style("fill", function(d) { return color(d.data.type); });

//      g.append("text")
//          .attr("class","whitelabel")
//          .style("font-size","90px")
//          .attr("transform", function(d) { return "translate(" + labelArc.centroid(d) + ")"; })
//          .attr("dy", ".35em")
//          .text(function(d) { return d.data.type; });
  
    function type(d) {
      d.value = +d.value;
      return d;
    }
};



//// Example usage:
//var CircleVis1 = new CircleVis("Janet", "Applied Physics");
//CircleVis1.sayHello();   // "Hello, I'm Janet. I'm studying Applied Physics."
//CircleVis1.walk();       // "I am walking!"
//CircleVis1.sayGoodBye(); // "Goodbye!"
//


