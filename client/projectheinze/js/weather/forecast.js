// Define the ForeCast constructor
function ForeCast(svg, woied) {
  // Call the parent constructor, making sure (using Function#call)
  // that "this" is set correctly during the call
  WeatherVis.call(this, svg, woied);
  
}

// Create a ForeCast.prototype object that inherits from WeatherVis.prototype.
// Note: A common error here is to use "new WeatherVis()" to create the
// ForeCast.prototype. That's incorrect for several reasons, not least 
// that we don't have anything to give WeatherVis for the "firstName" 
// argument. The correct place to call WeatherVis is above, where we call 
// it from ForeCast.
ForeCast.prototype = Object.create(WeatherVis.prototype); // See note below

// Set the "constructor" property to refer to ForeCast
ForeCast.prototype.constructor = ForeCast;


// Replace the "sayHello" method
ForeCast.prototype.drawGraph = function(){
        var labels = {
            "Sat":"Za",
            "Sun":"Zo",
            "Mon":"Ma",
            "Tue":"Di",
            "Wed":"Wo",
            "Thu":"Do",
            "Fri":"Vr"
        }    
        
        var link = [
            this.data.forecast[1],
            this.data.forecast[2],
            this.data.forecast[3]
        ]
        
        for(var i=0;i<link.length;i++){
            
//            var day = this.data.forecast[i];
            var day = this.data.forecast[0];
            var iconFile = this.icons[day.text.toLocaleLowerCase()];
            if(iconFile == undefined){
                iconFile = this.icons["partly cloudy (day)"];
            }
                        
            var vis = this;
            setupDay(iconFile,i);
            
        }
    
    function setupDay(iconFile,i){
         var day = vis.data.forecast[i];
          d3.xml("../icons/"+ iconFile +".svg", "image/svg+xml", function(error, xml) {
                    if (error) throw error;

            //importing an icon from a svg file
            //If anybody knows a better way to import a simple icon, please let me know, this one is killing me.
                    $("#svgbackup").append(xml.documentElement);
                    d3.select("#svgbackup").select("g").attr("class","weatherIcon"+i).attr("opacity",0);
                    $("#svgbackup g").appendTo("#svg");

                    var rect = d3.select(".weatherIcon"+i).node().getBBox();
                    var widthPerc = rect.width/(600);
                    var heightPerc = rect.height/vis.canvasHeight;

                    var newScale = (15*widthPerc);

                    d3.selectAll(".weatherIcon"+i).attr("transform","scale("+newScale+")")
                    .style("fill","#5c5aa8");

                    var xOffset = 20;
                    var yOffset = (250*i)-30;

                    d3.selectAll(".weatherIcon"+i).attr("transform","translate("+xOffset+","+yOffset+")scale("+newScale+")")
                    .transition()
                    .duration(vis.aniDuration)
                    .attr("opacity",1.0);
                    
                    var yOffset = (160)+250*i;
              
                    vis.canvas
                    .append("text")
                    .attr("class","label")
                    .style("fill","#5c5aa8")
                    .style("font-size",vis.canvasHeight/4)
                    .attr("class", "label")
                    .attr("text-anchor","left")
                    .attr("x",vis.canvasWidth*0.55)
                    .attr("y",yOffset)
                    .text(labels[day.day]);

               });
    }
}