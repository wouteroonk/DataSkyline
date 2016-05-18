//Get all divs
var columns = document.body.children[0].children; // Get columns
var childNodes = 0;
for (var i=0;i<columns.length;i++) {
	childNodes += columns[i].children.length;
}

var colors = ['red', 'brown', 'orange', 'yellow', 'lime', 'green', 'turquoise', 'blue', 'purple', 'CadetBlue', 'DarkSalmon', 'FloralWhite', 'GreenYellow'];
var mid = false; //true for middle screen

function changeColor(){
	var randomChild = Math.floor(Math.random() * childNodes);

	switch(childNodes) {
	 case 17: //leftscreen
	      if(randomChild >= 9){
					var currentColumn = 2;
					var currentNode = randomChild - 9;
				} else if(randomChild >= 5){
					var currentColumn = 1;
					var currentNode = randomChild - 5;
				} else {
					var currentColumn = 0;
					var currentNode = randomChild;
				}
	      break;
	  case 16: //rightscreen
	      if(randomChild >= 12){
					var currentColumn = 3;
					var currentNode = randomChild - 12;
				} else if(randomChild >= 8){
					var currentColumn = 2;
					var currentNode = randomChild - 8;
				} else if(randomChild >= 4){
					var currentColumn = 1;
					var currentNode = randomChild - 4;
				} else {
					var currentColumn = 0;
					var currentNode = randomChild;
				}
	      break;
	  case 0:
	  		mid = true;
	  		break;
	  default:
	      console.warn("Unknown amount of child nodes: " + childNodes);
	}
	
	if(mid){
		var newNode = document.body.children[0];
	} else{
		var newNode = columns[currentColumn].children[currentNode];
	}

	var randomColorNumber = Math.floor(Math.random() * colors.length);
	var color = colors[randomColorNumber];

	newNode.style.backgroundColor = color;

	if(mid){  //Amount of milliseconds for random new timer
		var speed = 500;
	} else {
		var speed = 80;
	}
	var randomTime = Math.floor((Math.random() * speed) + 1);
	setTimeout(function(){ changeColor(); }, randomTime);
}

function initDisco(){
	//Initialize random colors
	for (var i=0;i<columns.length;i++) {
		var columnChildren = columns[i].children;
		for (var y=0;y<columnChildren.length;y++){
			var randomColorNumber = Math.floor(Math.random() * colors.length);
			var color = colors[randomColorNumber];
			columnChildren[y].style.backgroundColor = color;
		}
	}

	changeColor(); //Start animation :)
}

initDisco(); // Init each cell