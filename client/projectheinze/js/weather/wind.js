// Define the WindVis constructor
function WindVis(svg, woied) {
  // Call the parent constructor, making sure (using Function#call)
  // that "this" is set correctly during the call
  WeatherVis.call(this, svg, woied);
  
}

// Create a WindVis.prototype object that inherits from WeatherVis.prototype.
// Note: A common error here is to use "new WeatherVis()" to create the
// WindVis.prototype. That's incorrect for several reasons, not least 
// that we don't have anything to give WeatherVis for the "firstName" 
// argument. The correct place to call WeatherVis is above, where we call 
// it from WindVis.
WindVis.prototype = Object.create(WeatherVis.prototype); // See note below

// Set the "constructor" property to refer to WindVis
WindVis.prototype.constructor = WindVis;

WindVis.prototype.calcWind = function(wind){
    
    
    switch(wind.toLowerCase()) {
    case "n":
        return -90;
        break;
    case "nne":
        return -67.5;
        break;
    case "ne":
        return -45;
        break;
    case "ene":
        return -22.5;
        break;
    case "e":
        return 0;
        break;
    case "ese":
        return 22.5;
        break;
    case "se":
        return 45;
        break;
    case "sse":
        return 67.5;
        break;
    case "s":
        return 90;
        break;
    case "ssw":
        return 112.5;
        break;
    case "sw":
        return 135;
        break;
    case "wsw":
        return 157.5;
        break;
    case "w":
        return 180;
        break;
    case "wnw":
        return 202.5;
        break;
    case "nw":
        return 225;
        break;
    case "nnw":
        return 247.5;
        break;
    default:
        return 0;
    }
            
}
    

    // Replace the "sayHello" method
WindVis.prototype.drawGraph = function(){
            
        var iconFile = this.icons[this.data.text.toLocaleLowerCase()]
                        
        var vis = this;
    
      d3.xml("../icons/arrow.svg", "image/svg+xml", function(error, xml) {
            if (error) throw error;


    //importing an icon from a svg file
    //If anybody knows a better way to import a simple icon, please let me know, this one is killing me.
            $("#svgbackup").append(xml.documentElement);
            d3.select("#svgbackup").select("g").attr("class","weatherIcon");
            $("#svgbackup g").appendTo("#svg");

            var rect = d3.select(".weatherIcon").node().getBBox();
            var widthPerc = rect.width/(vis.canvasWidth/4);
            var heightPerc = rect.height/vis.canvasHeight;
            var newScale = (11*widthPerc);

            d3.selectAll(".weatherIcon").attr("transform","scale("+newScale+")");

            var xOffset = -20;
            var yOffset = -50;
            
            var icon = d3.selectAll(".weatherIcon")
            .style("fill","#5c5aa8")
            .attr("transform","translate("+xOffset+","+yOffset+")scale("+newScale+")");

            icon.transition().duration(vis.aniDuration)
                .attrTween("transform", rotTween);

            function rotTween() {
                var i = d3.interpolate(0, vis.calcWind(vis.data.wind.direction));
//                var i = d3.interpolate(0, 360);
                return function(t) {
                    return "translate("+xOffset+","+yOffset+")scale("+newScale+")rotate(" + i(t) + ","+rect.width*0.8+","+rect.height+")";
                };
            }
          
//            .attr("transform","rotate("+vis.calcWind(vis.data.wind.direction)+","+xOffset+","+yOffset+")scale("+(0.8/widthPerc)+")");


            var end_val =[parseInt(vis.data.wind.speed)];
                vis.canvas
                .selectAll(".label")
                .data(end_val)
                .enter()
                .append("text")
                .style("fill","#5c5aa8")
                .style("font-size",vis.canvasHeight/2)
                .attr("class", "label")
                .attr("text-anchor","middle")
                .attr("x",vis.canvasWidth*0.70)
                .attr("y",vis.canvasHeight*0.50)
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
                .attr("x",vis.canvasWidth*0.70)
                .attr("y",vis.canvasHeight*0.85)
                .style("fill","#5c5aa8")
                .attr("text-anchor","middle")
                 .style("font-size",vis.canvasHeight/3)
                .text("km/h");

       });
}