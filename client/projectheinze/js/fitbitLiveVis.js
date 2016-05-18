// Define the FitbitLive constructor
function FitbitLive(svg, url) {
  // Call the parent constructor, making sure (using Function#call)
  // that "this" is set correctly during the call
  FitbitBaseVis.call(this, svg, url);

}

// Create a FitbitLive.prototype object that inherits from FitbitBaseVis.prototype.
// Note: A common error here is to use "new FitbitBaseVis()" to create the
// FitbitLive.prototype. That's incorrect for several reasons, not least 
// that we don't have anything to give FitbitBaseVis for the "firstName" 
// argument. The correct place to call FitbitBaseVis is above, where we call 
// it from FitbitLive.
FitbitLive.prototype = Object.create(FitbitBaseVis.prototype); // See note below

// Set the "constructor" property to refer to FitbitLive
FitbitLive.prototype.constructor = FitbitLive;

// Replace the "sayHello" method
FitbitLive.prototype.drawGraph = function(){
  
    //Draw + Update 
    var Vis = this;
    var rSize;
    if(this.canvasHeight>this.canvasWidth){
        rSize = this.canvasWidth/2;
    }else{
        rSize = this.canvasHeight/2;
    }
    
    
    var endValue = this.canvasHeight-(this.canvasHeight*(this.data/this.maxValue));
    
    var group = this.canvas.append("g");
    
    var index =0;
    
    
    
    group
    .append("text")
    .attr("class","label")
    .style("fill","#383838")
    .style("font-size",Vis.canvasHeight/3)
    .attr("text-anchor","middle")
    .attr("x",Vis.canvasWidth/2)
    .attr("y",Vis.canvasHeight*0.60)
    .text(this.data[index].value);
    
    index++;
    
    var interval = window.setInterval(function(){
        
        
        d3
        .select(".label")
        .transition()
        .duration(300)
        .tween("text", function(d) {
            //Got the tween function from http://jsfiddle.net/c5YVX/8/
                var i = d3.interpolate(this.textContent, Vis.data[index].value),
                    prec = (Vis.data[index].value + "").split("."),
                    round = (prec.length > 1) ? Math.pow(10, prec[1].length) : 1;

                return function(t) {
                    this.textContent = Math.round(i(t) * round) / round;
                };
            });
        index++;
        
        if(index>=Vis.data.length){
            index=0;
        }
        
        
        
        
        
    },1000);
};

// Add a "sayGoodBye" method
FitbitLive.prototype.sayGoodBye = function(){

};

//// Example usage:
//var FitbitLive1 = new FitbitLive("Janet", "Applied Physics");
//FitbitLive1.sayHello();   // "Hello, I'm Janet. I'm studying Applied Physics."
//FitbitLive1.walk();       // "I am walking!"
//FitbitLive1.sayGoodBye(); // "Goodbye!"
//
//// Check that instanceof works correctly


