// Define the ShapeSetVis constructor
function ShapeSetVis(svg, url, set) {
  // Call the parent constructor, making sure (using Function#call)
  // that "this" is set correctly during the call
  VisObject.call(this, svg, url);
  
//Set example object
//  {"state 1":"icon1.svg",
//  "state 2":"icon2.svg"}
  this.set = set
}

// Create a ShapeSetVis.prototype object that inherits from VisObject.prototype.
// Note: A common error here is to use "new VisObject()" to create the
// ShapeSetVis.prototype. That's incorrect for several reasons, not least 
// that we don't have anything to give VisObject for the "firstName" 
// argument. The correct place to call VisObject is above, where we call 
// it from ShapeSetVis.
ShapeSetVis.prototype = Object.create(VisObject.prototype); // See note below

// Set the "constructor" property to refer to ShapeSetVis
ShapeSetVis.prototype.constructor = ShapeSetVis;

// Replace the "sayHello" method
ShapeSetVis.prototype.drawGraph = function(){
  
    //Draw + Update 
    
    var rSize;
    if(this.canvasHeight>this.canvasWidth){
        rSize = this.canvasWidth/2;
    }else{
        rSize = this.canvasHeight/2;
    }
    
    
    var statelabel = "state 1"
    d3.xml(this.set[statelabel], "image/svg+xml", function(error, xml) {
        
        //We probably have to put the svg into 
        $("#svgbackup").append(xml.documentElement);
        d3.select("#svgbackup").select("path").attr("class","iconStroke iconObject");
        $("#svgbackup path").clone().appendTo("#svg");
        d3.select("#svgbackup").select("path").attr("class","iconFill iconObject");
        $("#svgbackup path").appendTo("#svg");
    });
    var group = this.canvas.append("g");
    
    
    group
    .selectAll(".label")
    .data(end_val)
    .enter()
    .append("text")
    .style("fill","#383838")
    .style("font-size",this.canvasHeight/3)
    .attr("class", "label")
    .attr("text-anchor","middle")
    .attr("x",this.canvasWidth/2)
    .attr("y",this.canvasHeight*0.60)
    .text(0)
    .transition()
    .duration(this.aniDuration)
    .tween("text", function(d) {
        //Got the tween function from http://jsfiddle.net/c5YVX/8/
            var i = d3.interpolate(this.textContent, d),
                prec = (d + "").split("."),
                round = (prec.length > 1) ? Math.pow(10, prec[1].length) : 1;

            return function(t) {
                this.textContent = Math.round(i(t) * round) / round;
            };
        });
};

// Add a "sayGoodBye" method
ShapeSetVis.prototype.sayGoodBye = function(){
  
};

//// Example usage:
//var ShapeSetVis1 = new ShapeSetVis("Janet", "Applied Physics");
//ShapeSetVis1.sayHello();   // "Hello, I'm Janet. I'm studying Applied Physics."
//ShapeSetVis1.walk();       // "I am walking!"
//ShapeSetVis1.sayGoodBye(); // "Goodbye!"
//
//// Check that instanceof works correctly

//          


