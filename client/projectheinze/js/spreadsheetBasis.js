//Be sure to also import Tabletop.js!
// Define the CircleVis constructor
function SpreadsheetVis(svg, key) {
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
SpreadsheetVis.prototype = Object.create(VisObject.prototype); // See note below

// Set the "constructor" property to refer to CircleVis
SpreadsheetVis.prototype.constructor = SpreadsheetVis;

//Replace the getData part
SpreadsheetVis.prototype.getData = function(){
      var visObject = this;
    
      Tabletop.init( { key: this.url,
                   callback: function(data, tabletop) { 
                       
                       visObject.data = data;
                       
                        if(this.update){
                            visObject.updateGraph();
                        } else {
                            visObject.drawGraph();
                            visObject.update = true;
                        }
                   
                   },
                   simpleSheet: false } )
      
};