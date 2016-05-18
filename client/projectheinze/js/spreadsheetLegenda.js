// Define the CircleVis constructor
function SpreadsheetLegenda(svg, url) {
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
SpreadsheetLegenda.prototype = Object.create(SpreadsheetVis.prototype); // See note below

// Set the "constructor" property to refer to CircleVis
SpreadsheetLegenda.prototype.constructor = SpreadsheetLegenda;

    // Replace the "sayHello" method
SpreadsheetLegenda.prototype.drawGraph = function(){
   
    var Vis = this;
   //TODO: custom keys!
    var data = this.data.tracks.elements;
    // Set the dimensions of the canvas / graph
    width = this.canvasWidth;
    height = this.canvasHeight;
    
    var cList = [];
    $.each(data,function(index,value){
        cList.push(data[index]["type"]);
    });
    
    var color = d3.scale.ordinal()
                .domain(cList
                .filter(function(key) { return key !== "date"; }))
                .range(["#06bdea","#9bb717","#ed1e68","#ff912b","#5c4fd9"]);
    
    
    Vis.canvas
    .selectAll(".blocks")
    .data(data)
    .enter()
    .append("rect")
    .attr("width",Vis.canvasWidth)
    .attr("height",Vis.canvasHeight/data.length)
    .attr("x",0)
    .attr("y",function(d,i){ return i*(Vis.canvasHeight/3) })
    .attr("fill",function(d){ return color(d.type);})
    
    Vis.canvas
    .selectAll(".label")
    .data(data)
    .enter()
    .append("text")
    .attr("fill","#ffffff")
    .attr("font-size",Vis.canvasHeight/4)
    .attr("text-anchor","middle")
    .text(function(d){return d.type})
    .attr("x",Vis.canvasWidth/2)
    .attr("y",function(d,i){ return (Vis.canvasHeight*0.25+(i*Vis.canvasHeight/3)) })
    
};



//// Example usage:
//var CircleVis1 = new CircleVis("Janet", "Applied Physics");
//CircleVis1.sayHello();   // "Hello, I'm Janet. I'm studying Applied Physics."
//CircleVis1.walk();       // "I am walking!"
//CircleVis1.sayGoodBye(); // "Goodbye!"
//


