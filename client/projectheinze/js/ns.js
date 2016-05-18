// Define the NSVis constructor
function NSVis(svg, url) {
  // Call the parent constructor, making sure (using Function#call)
  // that "this" is set correctly during the call
  VisObject.call(this, svg, url);

}

// Create a NSVis.prototype object that inherits from VisObject.prototype.
// Note: A common error here is to use "new VisObject()" to create the
// NSVis.prototype. That's incorrect for several reasons, not least 
// that we don't have anything to give VisObject for the "firstName" 
// argument. The correct place to call VisObject is above, where we call 
// it from NSVis.
NSVis.prototype = Object.create(VisObject.prototype); // See note below

// Set the "constructor" property to refer to NSVis
NSVis.prototype.constructor = NSVis;


NSVis.prototype.getData = function(){
        
    var ourSelf = this;
        this.xhr.get(function(err, response) {

            ourSelf.data = response;
            for(var i=0;i<ourSelf.data.length;i++){
               ourSelf.data[i].vertrekTijd = new Date(ourSelf.data[i].vertrekTijd*1000); 
            }
            

            if(this.update){
                ourSelf.updateGraph();
            } else {
                ourSelf.drawGraph();
                ourSelf.update = true;
            }
            
            return response;
            
        }); 
        
}


// Replace the "sayHello" method
NSVis.prototype.drawGraph = function(){
  
    //Draw + Update 
    var ourSelf = this;
//    ourSelf.data[2].vertrekVertraging = "5"

    
    this.canvas
    .selectAll(".labelstation")
    .data(ourSelf.data)
    .enter()
    .append("text")
    .style("fill",function(d){ 
        var color = "#383838";
        if(d.vertrekVertraging != null){
            color = "#f79131";
        }
        return color;
    
    })
    .style("font-size",this.canvasHeight/12)
    .attr("class", "label")
    .attr("text-anchor","left")
    .attr("x",this.canvasWidth*0.1)
    .attr("y",function(d,i){ return ((i+1)*(ourSelf.canvasHeight*0.19));})
    .text(function(d){ return d.eindBestemming});
    
    
    this.canvas
    .selectAll(".labeltime")
    .data(ourSelf.data)
    .enter()
    .append("text")
    .style("fill", function(d){ 
        var color = "#383838";
        if(d.vertrekVertraging != null){
            color = "#f79131";
        }
        return color;
    
    })
    .style("font-size",this.canvasHeight/12)
    .attr("class", "label")
    .attr("text-anchor","left")
    .attr("x",this.canvasWidth*0.7)
    .attr("y",function(d,i){ return ((i+1)*(ourSelf.canvasHeight*0.19));})
    .text(function(d){ return pad(d.vertrekTijd.getHours(),2)+":"+pad(d.vertrekTijd.getMinutes(),2)});
    
    this.canvas
    .selectAll(".labeldelay")
    .data(ourSelf.data)
    .enter()
    .append("text")
    .style("fill", function(d){ 
        var color = "#383838";
        if(d.vertrekVertraging != null){
            color = "#f79131";
        }
        return color;
    
    })
    .style("font-size",this.canvasHeight/14)
    .attr("class", "label")
    .attr("text-anchor","left")
    .attr("x",this.canvasWidth*0.89)
    .attr("y",function(d,i){ return ((i+1)*(ourSelf.canvasHeight*0.19));})
    .text(function(d){ if(d.vertrekVertraging == null){return "";}return "+"+d.vertrekVertraging});
    
    function pad(n, width, z) {
  z = z || '0';
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}
};

// Add a "sayGoodBye" method
NSVis.prototype.sayGoodBye = function(){

};

//// Example usage:
//var NSVis1 = new NSVis("Janet", "Applied Physics");
//NSVis1.sayHello();   // "Hello, I'm Janet. I'm studying Applied Physics."
//NSVis1.walk();       // "I am walking!"
//NSVis1.sayGoodBye(); // "Goodbye!"
//
//// Check that instanceof works correctly


