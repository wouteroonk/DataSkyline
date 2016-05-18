  // Define the VisObject constructor
var VisObject = function(svg, url) {
    
    //Canvas + animation settings
    this.canvas = svg;
    this.canvasWidth = this.canvas.node().getBoundingClientRect().width;
    this.canvasHeight = this.canvas.node().getBoundingClientRect().height;
    this.aniDuration = 3000;
    
    //XHR object
    this.url = url;
    this.xhr = d3.xhr(url, 'application/json');
    this.xhr.header('Accept', 'application/json');
    this.xhr.response(function(req) { return JSON.parse(req.responseText) });
    
    //url + boolean to see if vis has been drawn.
    this.maxValue = 9000;
    this.url;
    this.data;
    this.update = false;
    
    
     this.setMaxValue = function(maxValue){
        this.maxValue = maxValue;
    }
    
    this.setSource = function(url){
        this.url = url;
        this.update = false;
        this.getData();
    }

            
};

VisObject.prototype.drawGraph = function(){
  console.log("drawGraph original");
};

VisObject.prototype.updateGraph = function(){
        console.log("updateGraph");
}
 
VisObject.prototype.getData = function(){
        var ourSelf = this;
    
        this.xhr.get(function(err, response) {

            ourSelf.data = response.attributes[0].value;

            if(this.update){
                ourSelf.updateGraph();
            } else {
                ourSelf.drawGraph();
                ourSelf.update = true;
            }
            
            return response;
            
        }); 
        
}