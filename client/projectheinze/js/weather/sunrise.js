// Define the SunRise constructor
function SunRise(svg, woied) {
  // Call the parent constructor, making sure (using Function#call)
  // that "this" is set correctly during the call
  WeatherVis.call(this, svg, woied);
  this.unit = 'c';    
}

// Create a SunRise.prototype object that inherits from WeatherVis.prototype.
// Note: A common error here is to use "new WeatherVis()" to create the
// SunRise.prototype. That's incorrect for several reasons, not least 
// that we don't have anything to give WeatherVis for the "firstName" 
// argument. The correct place to call WeatherVis is above, where we call 
// it from SunRise.
SunRise.prototype = Object.create(WeatherVis.prototype); // See note below

// Set the "constructor" property to refer to SunRise
SunRise.prototype.constructor = SunRise;


// Replace the "sayHello" method
SunRise.prototype.drawGraph = function(){
   var iconFile = "sunrise";
        
     console.log(this.data);
        var vis = this;
    
      d3.xml("../icons/"+ iconFile +".svg", "image/svg+xml", function(error, xml) {
            if (error) throw error;

            
    //importing an icon from a svg file
    //If anybody knows a better way to import a simple icon, please let me know, this one is killing me.
            $("#svgbackup").append(xml.documentElement);
            d3.select("#svgbackup").select("g").attr("class","weatherIcon").attr("opacity",0);
            $("#svgbackup g").appendTo("#svg");
            
          
            //cleaning the value
            var sunrise = vis.data.sunrise.replace(" am","");
            var sunset = vis.data.sunset.replace(" pm","");      
            vsunset = (parseInt(sunset.substr(0,sunset.indexOf(":")))+12);
            sunset = vsunset+sunset.substr(sunset.indexOf(":"),200);
                
            var rect = d3.select(".weatherIcon").node().getBBox();
            var widthPerc = rect.width/(vis.canvasWidth/2);
            var heightPerc = rect.height/vis.canvasHeight;

            var newScale = (700*widthPerc);

            d3.selectAll(".weatherIcon").attr("transform","scale("+newScale+")")
            .style("fill","#5c5aa8");
            
            var xOffset = -160;
            var yOffset = -130;
            d3.selectAll(".weatherIcon").attr("transform","translate("+xOffset+","+yOffset+")scale("+newScale+")")
            .transition()
            .duration(vis.aniDuration)
            .attr("opacity",1.0);
          
            var end_val =[parseInt(vis.data.temp)];
                vis.canvas
                .selectAll(".label")
                .data(end_val)
                .enter()
                .append("text")
                .style("fill","#5c5aa8")
                .style("font-size",vis.canvasHeight/4)
                .attr("class", "label")
                .attr("text-anchor","end")
                .attr("x",vis.canvasWidth*0.95)
                .attr("y",vis.canvasHeight*0.65)
                .text(sunrise);
                
          
                vis.canvas
                .append("text")
                .style("fill","#5c5aa8")
                .attr("text-anchor","end")
                .attr("x",vis.canvasWidth*0.95)
                .attr("y",vis.canvasHeight*0.85)
                 .style("font-size",vis.canvasHeight/4)
                .text(sunset);
      });
}


//// Example usage:
//var SunRise1 = new SunRise("Janet", "Applied Physics");
//SunRise1.sayHello();   // "Hello, I'm Janet. I'm studying Applied Physics."
//SunRise1.walk();       // "I am walking!"
//SunRise1.sayGoodBye(); // "Goodbye!"
//


