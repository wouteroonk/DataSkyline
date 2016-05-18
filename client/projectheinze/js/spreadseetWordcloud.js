// Define the CircleVis constructor
function SpreadsheetWordcloud(svg, url) {
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
SpreadsheetWordcloud.prototype = Object.create(SpreadsheetVis.prototype); // See note below

// Set the "constructor" property to refer to CircleVis
SpreadsheetWordcloud.prototype.constructor = SpreadsheetWordcloud;

// Replace the "sayHello" method
SpreadsheetWordcloud.prototype.drawGraph = function(){
    var Vis = this;
 //TODO: custom keys!
    var data = this.data.orgs.elements;
    
    // Set the dimensions of the canvas / graph
    var margin = {top: 10, right: 10, bottom: 10, left: 10},
    width = this.canvasWidth - margin.left - margin.right,
    height = this.canvasHeight - margin.top - margin.bottom;
 
    function colors_skyline(n) {
      var colors = ["#06bdea","#9bb717","#ed1e68","#ff912b","#5c4fd9"];
      return colors[n % colors.length];
    }

    var layout = d3.layout.cloud()
    .size([width, height])
    .words(this.data.orgs.elements)
//    .padding(10)
    .padding(4)
    .rotate(function() { return 0; })
    .font('Open Sans Condensed')
//    .fontSize(function(d) { if(d.text == "Saxion"){return d.size*2;}else{return d.size*12;} })
    .fontSize(function(d) { if(d.text == "Saxion"){return d.size/2;}else{return d.size*8;} })
    .on("end", draw);

layout.start();

function draw(words) {
    Vis.canvas
    .append("g")
      .attr("transform", "translate(" + layout.size()[0] / 2 + "," + layout.size()[1] / 2 + ")")
    .selectAll("text")
      .data(words)
    .enter().append("text")
      .style("font-size", function(d) { return d.size + "px"; })
      .style("font-family", 'Open Sans Condensed')
      .style("fill", function(d, i) { return colors_skyline(i); })
      .attr("text-anchor", "middle")
      .attr("transform", function(d) {
        return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
      })
      .text(function(d) { return d.text; });
}
};



//// Example usage:
//var CircleVis1 = new CircleVis("Janet", "Applied Physics");
//CircleVis1.sayHello();   // "Hello, I'm Janet. I'm studying Applied Physics."
//CircleVis1.walk();       // "I am walking!"
//CircleVis1.sayGoodBye(); // "Goodbye!"
//


