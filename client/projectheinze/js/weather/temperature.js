// Define the TempatureVis constructor
function TempatureVis(svg, woied) {
  // Call the parent constructor, making sure (using Function#call)
  // that "this" is set correctly during the call
  WeatherVis.call(this, svg, woied);
  
}

// Create a TempatureVis.prototype object that inherits from WeatherVis.prototype.
// Note: A common error here is to use "new WeatherVis()" to create the
// TempatureVis.prototype. That's incorrect for several reasons, not least 
// that we don't have anything to give WeatherVis for the "firstName" 
// argument. The correct place to call WeatherVis is above, where we call 
// it from TempatureVis.
TempatureVis.prototype = Object.create(WeatherVis.prototype); // See note below

// Set the "constructor" property to refer to TempatureVis
TempatureVis.prototype.constructor = TempatureVis;


// Replace the "sayHello" method
TempatureVis.prototype.drawGraph = function(){
        
    
        var iconFile = this.icons[this.data.text.toLocaleLowerCase()];
        if(iconFile == undefined){
            iconFile = this.icons["partly cloudy (day)"];
        }
                        
        var vis = this;
    
      d3.xml("../icons/"+ iconFile +".svg", "image/svg+xml", function(error, xml) {
            if (error) throw error;

            
    //importing an icon from a svg file
    //If anybody knows a better way to import a simple icon, please let me know, this one is killing me.
            $("#svgbackup").append(xml.documentElement);
            d3.select("#svgbackup").select("g").attr("class","weatherIcon").attr("opacity",0);
            $("#svgbackup g").appendTo("#svg");

            var rect = d3.select(".weatherIcon").node().getBBox();
            var widthPerc = rect.width/(vis.canvasWidth/2);
            var heightPerc = rect.height/vis.canvasHeight;

            var newScale = (15*widthPerc);

            d3.selectAll(".weatherIcon").attr("transform","scale("+newScale+")")
            .style("fill","#5c5aa8");
            
            var xOffset = 20;
            var yOffset = newScale;
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
                .style("font-size",vis.canvasHeight/3)
                .attr("class", "label")
                .attr("text-anchor","end")
                .attr("x",vis.canvasWidth*0.5)
                .attr("y",vis.canvasHeight*0.90)
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
                
          
                vis.canvas
                .append("text")
                .style("fill","#5c5aa8")
                .attr("x",vis.canvasWidth*0.5)
                .attr("y",vis.canvasHeight*0.90)
                 .style("font-size",vis.canvasHeight/3)
                .text("°C");

       });
}