var widget;
function init(){
  
    var keyUrl = "1DtCiQWx9LAwF0D4JGnvDWd2bCqE1CqAYBqDdgIt10ss"; 
    // Build widget    
    widget = new SpreadsheetLineVis(d3.select("#svg"),keyUrl);
    // Getting the max value from the url is async, so callback construction is needed.
    widget.getData();

}
