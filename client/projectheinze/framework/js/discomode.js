var columns = document.body.children[0].children; // Get columns
//Get all divs
var childNodes;
for (var i=0;i<columns.length;i++) {
	var nodes = columns[i].children;
	childNodes += nodes;
	console.log(childNodes);
}


var mid = false;
if(columns.length == 0){ //Fix for middle screen
	mid = true;
	var columns = document.body.children[0];
	console.log(columns);
}
var colors = ['red', 'brown', 'orange', 'yellow', 'lime', 'green', 'turquoise', 'blue', 'purple', 'CadetBlue', 'DarkSalmon', 'FloralWhite', 'GreenYellow'];
//console.log(columns);

/*function changeColor(){
	if(!mid){
		for (var i=0;i<columns.length;i++) {
			//console.log(columns[i]);
			var childNodes = columns[i].children;

			for(var y=0;y<childNodes.length;y++){
				var randomColorNumber = Math.floor(Math.random() * colors.length);
				var color = colors[randomColorNumber];

				//console.log(childNodes[y]);
				childNodes[y].style.backgroundColor = color;

			}

		}
	} else {
		var randomColorNumber = Math.floor(Math.random() * colors.length);
		var color = colors[randomColorNumber];
		columns.style.backgroundColor = color;
	}

	var randomTime = Math.floor((Math.random() * 1500) + 1);
	//console.log(randomTime);
	setTimeout(function(){ changeColor(); }, randomTime);
}

changeColor(); // Start animation :)
*/

function changeColor2(){

	if(!mid){
				var randomNode = Math.floor(Math.random() * childNodes.length);
				console.log("Random node: " + randomNode);

				var randomColorNumber = Math.floor(Math.random() * colors.length);
				var color = colors[randomColorNumber];

				//console.log(childNodes[y]);
				childNodes[randomNode].style.backgroundColor = color;

			

		
	} /*else {
		var randomColorNumber = Math.floor(Math.random() * colors.length);
		var color = colors[randomColorNumber];
		columns.style.backgroundColor = color;
	}*/

	var randomTime = Math.floor((Math.random() * 1500) + 1);
	//console.log(randomTime);
	//setTimeout(function(){ changeColor2(); }, randomTime);
}

changeColor2(); // Start animation :)