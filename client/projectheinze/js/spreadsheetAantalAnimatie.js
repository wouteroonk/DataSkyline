// Define the CircleVis constructor
function SpreadsheetAnimatie(svg, url,mainKey) {
      // Call the parent constructor, making sure (using Function#call)
      // that "this" is set correctly during the call
    this.key = mainKey;
  SpreadsheetVis.call(this, svg, url);

}

// Create a CircleVis.prototype object that inherits from VisObject.prototype.
// Note: A common error here is to use "new VisObject()" to create the
// CircleVis.prototype. That's incorrect for several reasons, not least 
// that we don't have anything to give VisObject for the "firstName" 
// argument. The correct place to call VisObject is above, where we call 
// it from CircleVis.
SpreadsheetAnimatie.prototype = Object.create(SpreadsheetVis.prototype); // See note below

// Set the "constructor" property to refer to CircleVis
SpreadsheetAnimatie.prototype.constructor = SpreadsheetAnimatie;

    // Replace the "sayHello" method
SpreadsheetAnimatie.prototype.drawGraph = function(){
   
    var Vis = this;
   //TODO: custom keys!
    var data = this.data[this.key].elements;
    
    // Set the dimensions of the canvas / graph
    
    var sizeLabel = Vis.canvasWidth/4;
    if(this.key == "steden"){
        sizeLabel = Vis.canvasWidth/8;
    }
    
    var index = 0;
    var current = data[index];
    
    Vis.canvas
        .append("text")
        .attr("class","textlabel")
        .style("font-size",sizeLabel)
        .attr("text-anchor","middle")
        .attr("x",-Vis.canvasWidth*2)
        .attr("y", this.canvasHeight*0.4)
        .text(function() { return current.type;})
        .transition()
        .duration(Vis.aniDuration)
        .attr("x", Vis.canvasWidth/2);
    
    Vis.canvas
        .append("text")
        .attr("class","valuelabel")
        .style("font-size",Vis.canvasWidth/4)
        .attr("text-anchor","middle")
        .attr("x",Vis.canvasWidth*2)
        .attr("y", Vis.canvasHeight*0.85)
        .text(function() { return current.value;})
        .transition()
        .duration(Vis.aniDuration)
        .attr("x", Vis.canvasWidth/2);
    
    index ++;
    
    var interval = window.setInterval(function(){
        showStuff();  
    },10000);
        
    function showStuff() {
        current = data[index];
        
        
        d3.select(".textlabel")
        .transition()
        .duration(Vis.aniDuration)
        .attr("x", Vis.canvasWidth*2)
        .each("end", function(){
            
            d3.select(".textlabel")
            .attr("x",-Vis.canvasWidth*2)
            .text(function() { return current.type;})
            .transition()
            .duration(Vis.aniDuration)
            .attr("x", Vis.canvasWidth/2);
            
        });
        
        d3.select(".valuelabel")
        .transition()
        .duration(Vis.aniDuration)
        .attr("x", -Vis.canvasWidth*2)
        .each("end", function(){
            
            d3.select(".valuelabel")
            .attr("x",Vis.canvasWidth*2)
            .text(function() { return current.value;})
            .transition()
            .duration(Vis.aniDuration)
            .attr("x", Vis.canvasWidth/2);
            
        });
    
        index ++;
        
        if(index >= data.length){
            index = 0;
        }
    }
};



//// Example usage:
//var CircleVis1 = new CircleVis("Janet", "Applied Physics");
//CircleVis1.sayHello();   // "Hello, I'm Janet. I'm studying Applied Physics."
//CircleVis1.walk();       // "I am walking!"
//CircleVis1.sayGoodBye(); // "Goodbye!"
//


