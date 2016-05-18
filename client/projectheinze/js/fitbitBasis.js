//Be sure to also import Tabletop.js!
// Define the CircleVis constructor
function FitbitBaseVis(svg, key) {
  // Call the parent constructor, making sure (using Function#call)
  // that "this" is set correctly during the call
  VisObject.call(this, svg, key);

}

// Create a CircleVis.prototype object that inherits from VisObject.prototype.
// Note: A common error here is to use "new VisObject()" to create the
// CircleVis.prototype. That's incorrect for several reasons, not least 
// that we don't have anything to give VisObject for the "firstName" 
// argument. The correct place to call VisObject is above, where we call 
// it from CircleVis.
FitbitBaseVis.prototype = Object.create(VisObject.prototype); // See note below

// Set the "constructor" property to refer to CircleVis
FitbitBaseVis.prototype.constructor = FitbitBaseVis;

//Replace the getData part
FitbitBaseVis.prototype.getData = function(){
      var visObject = this;
    
         $.get( "http://vps1381.directvps.nl:3000/heart", function( data ) {
                  
             if(data[0] !== undefined){
                
                    visObject.data = data[0]['activities-heart-intraday'].dataset;
             
                }else{
                 
                    visObject.data = [{"time":"21:06:00","value":66},{"time":"21:06:10","value":64},{"time":"21:06:20","value":66},{"time":"21:06:30","value":68},{"time":"21:06:40","value":69},{"time":"21:06:50","value":69},{"time":"21:07:05","value":69},{"time":"21:07:10","value":68},{"time":"21:07:25","value":68},{"time":"21:07:30","value":67},{"time":"21:07:40","value":65},{"time":"21:07:45","value":63},{"time":"21:08:00","value":61},{"time":"21:08:15","value":61},{"time":"21:08:20","value":59},{"time":"21:08:30","value":59},{"time":"21:08:45","value":60},{"time":"21:08:50","value":61},{"time":"21:08:55","value":59},{"time":"21:09:00","value":58},{"time":"21:09:15","value":63},{"time":"21:09:20","value":63},{"time":"21:09:25","value":66},{"time":"21:09:30","value":66},{"time":"21:09:40","value":67}];
                    
                }
                        if(this.update){
                            visObject.updateGraph();
                        } else {
                            visObject.drawGraph();
                            visObject.update = true;
                        }
              });
      
};