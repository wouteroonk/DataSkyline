// Define the CircleVis constructor
function CircleVis(svg, url) {
  // Call the parent constructor, making sure (using Function#call)
  // that "this" is set correctly during the call
  VisObject.call(this, svg, url);

}

// Create a CircleVis.prototype object that inherits from VisObject.prototype.
// Note: A common error here is to use "new VisObject()" to create the
// CircleVis.prototype. That's incorrect for several reasons, not least 
// that we don't have anything to give VisObject for the "firstName" 
// argument. The correct place to call VisObject is above, where we call 
// it from CircleVis.
CircleVis.prototype = Object.create(VisObject.prototype); // See note below

// Set the "constructor" property to refer to CircleVis
CircleVis.prototype.constructor = CircleVis;

// Replace the "sayHello" method
CircleVis.prototype.drawGraph = function(){
  
    //Draw + Update 
    
    var rSize;
    if(this.canvasHeight>this.canvasWidth){
        rSize = this.canvasWidth/2;
    }else{
        rSize = this.canvasHeight/2;
    }
    
    
    var endValue = this.canvasHeight-(this.canvasHeight*(this.data/this.maxValue));
    
    var group = this.canvas.append("g");
    
    group
    .append("defs")
    .append("clipPath")
    //Id moet gekoppeld worden op de objecten die je wil masken
    .attr("id","mask")
    .append("rect")
    .attr("x",0)
    .attr("y",this.canvasHeight)
    .attr("height",this.canvasHeight)
    .attr("width",this.canvasWidth)
    .transition()
    .duration(this.aniDuration)
    .attr("y",endValue);
//    .attr("height",400);
    
    
    group
    .append("circle")
    .attr("cx",this.canvasWidth/2)
    .attr("cy",this.canvasHeight/2)
    .attr("r",rSize)
    .style("fill","#06bdea")
    //Link
    .attr("clip-path","url(#mask)")
    
    
    var end_val = [this.data];
    
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
CircleVis.prototype.sayGoodBye = function(){

};

//// Example usage:
//var CircleVis1 = new CircleVis("Janet", "Applied Physics");
//CircleVis1.sayHello();   // "Hello, I'm Janet. I'm studying Applied Physics."
//CircleVis1.walk();       // "I am walking!"
//CircleVis1.sayGoodBye(); // "Goodbye!"
//
//// Check that instanceof works correctly


