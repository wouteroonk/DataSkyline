var widget;
function init(){
    
    
    var url = "http://178.21.117.113:1026/v1/contextEntities/enschede-P3/attributes/free_spots"; 
    var max_url = "http://178.21.117.113:1026/v1/contextEntities/enschede-P3/attributes/max_spots";
    
    //Build widget    
//.attr("transform","rotate("+vis.calcWind(vis.data.wind.direction)+","+(rect.width)+","+(rect.height)+")translate("+xOffset+","+yOffset+")scale("+(0.8/widthPerc)+")");    widget = new IconVis(d3.select("#svg"),url,"Enschede P3");
    
    //Build Circlewidget    
    widget = new CircleVis(d3.select("#svg"),url);
    
    //Getting the max value from the url is async, so callback construction is needed.
    
    var xhr = d3.xhr(max_url, 'application/json');
    xhr.header('Accept', 'application/json');
    xhr.response(function(req) { return JSON.parse(req.responseText) });
    xhr.get(function(err, response) {
            widget.setMaxValue(response.attributes[0].value);
            widget.getData();
        });  
}
