// Define the CircleVis constructor
function SpreadsheetMap(svg, url, geoJson) {
      // Call the parent constructor, making sure (using Function#call)
      // that "this" is set correctly during the call
  SpreadsheetVis.call(this, svg, url);
    this.geoJson = geoJson
}

// Create a CircleVis.prototype object that inherits from VisObject.prototype.
// Note: A common error here is to use "new VisObject()" to create the
// CircleVis.prototype. That's incorrect for several reasons, not least 
// that we don't have anything to give VisObject for the "firstName" 
// argument. The correct place to call VisObject is above, where we call 
// it from CircleVis.
SpreadsheetMap.prototype = Object.create(SpreadsheetVis.prototype); // See note below

// Set the "constructor" property to refer to CircleVis
SpreadsheetMap.prototype.constructor = SpreadsheetMap;

    // Replace the "sayHello" method
SpreadsheetMap.prototype.drawGraph = function(){
   
    var data = this.data.weekbezoekers.elements;
    // Set the dimensions of the canvas / graph
    var margin = {top: -30, right: 50, bottom: 30, left: 50};
//   var width = this.canvasWidth - margin.left - margin.right;
//   var height = this.canvasHeight - margin.top - margin.bottom;
    var width = this.canvasWidth;
   var height = this.canvasHeight;
    var Vis = this;
  
       d3.json(this.geoJson, function(json) {
            var center = d3.geo.centroid(json);
             var scale = 6000;
           
           var offset = [Vis.canvasWidth/2, Vis.canvasHeight/2];
            //Dit is een belangrijk maar gecompliceerd stuk waar je een kaart projectie kiest
            var projection = d3.geo.mercator()
                       .translate(offset).scale(scale).center(center);
            var path = d3.geo.path().projection(projection);           
            
//           // using the path determine the bounds of the current map and use 
//      // these to determine better values for the scale and translation
      var bounds  = path.bounds(json);
           
      var hscale  = scale*width  / (bounds[1][0] - bounds[0][0]);
      var vscale  = scale*height / (bounds[1][1] - bounds[0][1]);
      var scale   = (hscale < vscale) ? hscale : vscale;
           scale = scale*0.9;
      var offset  = [width - (bounds[0][0] + bounds[1][0])/2,height - (bounds[0][1] + bounds[1][1])/2];
      
           
  // new projection
      projection = d3.geo.mercator().center(center)
        .scale(scale).translate(offset);
      path = path.projection(projection);
           
            Vis.canvas.selectAll("path")
                .data(json.features)
                .enter()
                .append("path")
                .attr("d", path)
                .attr("fill","#5c4fd9")
                .attr("opacity",0)
                .transition()
                .duration(Vis.aniDuration)
                .delay(function(d,i){
                    return i*(Vis.aniDuration/200);
                })
                .attr("opacity",1.0)
            
                //Ook hier kun je gewoon on functie en animatie functies op los laten!
//            Daarna alle markers erin zetten.
         
           Vis.canvas.selectAll("circle")
           .data(Vis.data.gasten.elements)
           .enter()
           .append("circle")
           .attr("cx", function(d) {
                   return projection([d.Longitude, d.Latitude])[0];
           })
           .attr("cy", function(d) {
                   return projection([d.Longitude, d.Latitude])[1];
           })
           .attr("r", 5)
           .style("fill", "#ff912b")
           .attr("opacity",0)
                .transition()
                .duration(Vis.aniDuration)
                .delay(function(d,i){
                    return 200+(i*(Vis.aniDuration/200));
                })
                .attr("opacity",1.0);
            
          });
};

//// Example usage:
//var CircleVis1 = new CircleVis("Janet", "Applied Physics");
//CircleVis1.sayHello();   // "Hello, I'm Janet. I'm studying Applied Physics."
//CircleVis1.walk();       // "I am walking!"
//CircleVis1.sayGoodBye(); // "Goodbye!"
//
//// Check that instanceof works correctly



