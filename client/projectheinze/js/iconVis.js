var stuff
// Define the IconVis constructor
function IconVis(svg, url, label) {
  // Call the parent constructor, making sure (using Function#call)
  // that "this" is set correctly during the call
  VisObject.call(this, svg, url);
  this.label = label;
    
}

// Create a IconVis.prototype object that inherits from VisObject.prototype.
// Note: A common error here is to use "new VisObject()" to create the
// IconVis.prototype. That's incorrect for several reasons, not least 
// that we don't have anything to give VisObject for the "firstName" 
// argument. The correct place to call VisObject is above, where we call 
// it from IconVis.
IconVis.prototype = Object.create(VisObject.prototype); // See note below

// Set the "constructor" property to refer to IconVis
IconVis.prototype.constructor = IconVis;

// Replace the "sayHello" method
IconVis.prototype.drawGraph = function(){
    
    var vis = this
    
    d3.xml("../icons/car.svg", "image/svg+xml", function(error, xml) {
        if (error) throw error;
        
        
        var canvas = vis.canvas
        var group = canvas.append("g");
        var defs= canvas.append("defs");
        
        
      
    //    .attr("height",400);

//importing an icon from a svg file
//If anybody knows a better way to import a simple icon, please let me know, this one is killing me.
        $("#svgbackup").append(xml.documentElement);
        d3.select("#svgbackup").select("path").attr("class","iconStroke iconObject");
        $("#svgbackup path").clone().appendTo("#svg");
        d3.select("#svgbackup").select("path").attr("class","iconFill iconObject");
        $("#svgbackup path").appendTo("#svg");

        //Scaling to whole thing
        var rect = d3.select(".iconFill").node().getBBox();
    
        var widthPerc = rect.width/vis.canvasWidth;
        var heightPerc = rect.height/vis.canvasHeight;
        var hscale  = 1*vis.canvasWidth  / rect.width;
        var vscale  = 1*vis.canvasHeight / rect.height;
        var newScale   = (hscale < vscale) ? hscale : vscale;
        newScale = newScale*0.8;
        
        d3.selectAll(".iconObject").attr("transform","scale("+newScale+")");
        var xOffset  = vis.canvasWidth *0.1;
        var yOffset = (vis.canvasHeight*0.2);
        d3.selectAll(".iconObject").attr("transform","translate("+xOffset+","+yOffset+")scale("+newScale+")");
        
        
        
        var endValue = rect.width*((vis.maxValue-vis.data)/vis.maxValue);
        
        //Setting up the mask
         defs
        .append("clipPath")
        //Id moet gekoppeld worden op de objecten die je wil masken
        .attr("id","mask")
        .append("rect")
        .attr("x",0)
        .attr("y",0)
        .attr("height",vis.canvasHeight)
        .attr("width",1)
        .transition()
        .duration(vis.aniDuration)
        .attr("width",endValue);
        
        //applying the mask
        d3.select(".iconFill").attr("clip-path","url(#mask)")
        
        var end_val = [vis.maxValue-vis.data];
        console.log(vis.data);
        
         canvas
         .selectAll(".whitelabel")
        .data(end_val)
        .enter()
        .append("text")
        .style("font-size",vis.canvasHeight/4)
        .attr("class", "whitelabel")
        .attr("text-anchor","middle")
        .attr("x",vis.canvasWidth*0.49)
        .attr("y",vis.canvasHeight*0.55)
         .text(0)
        .transition()
        .duration(vis.aniDuration)
        .tween("text", function(d) {
             
            //Got the tween function from http://jsfiddle.net/c5YVX/8/
                var i = d3.interpolate(this.textContent, d),
                    prec = (d + "").split("."),
                    round = (prec.length > 1) ? Math.pow(10, prec[1].length) : 1;

                return function(t) {
                    this.textContent = Math.round(i(t) * round) / round;
                };
            });
        
        canvas
        .append("text")
        .attr("class",".label")
        .style("font-size",vis.canvasHeight/8)
        .attr("class", "label")
        .attr("text-anchor","middle")
        .attr("x",vis.canvasWidth/2)
        .attr("y",vis.canvasHeight*0.15)
        //Hier moet dus een parameter voor komen.
        .text(vis.label);
        
        canvas
        .append("text")
        .attr("class",".label")
        .style("font-size",vis.canvasHeight/8)
        .attr("class", "label")
        .attr("text-anchor","middle")
        .attr("x",vis.canvasWidth/2)
        .attr("y",vis.canvasHeight*0.90)
        //Hier moet dus een parameter voor komen.
        .text("Parkeergarage");
        
        
    });
    
  
    //Draw + Update 
    
};


//// Example usage:
//var IconVis1 = new IconVis("Janet", "Applied Physics");
//IconVis1.sayHello();   // "Hello, I'm Janet. I'm studying Applied Physics."
//IconVis1.walk();       // "I am walking!"
//IconVis1.sayGoodBye(); // "Goodbye!"
//
//// Check that instanceof works correctly
//          


