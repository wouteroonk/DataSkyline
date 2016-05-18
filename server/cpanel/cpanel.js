/* Load, edit & generate config files */
var showMessage = false; //Dont show popup message on first load
function generateConfig(e){
  //console.log("Updating config: ");
  e = e || window.event;
  e = e.target || e.srcElement;
  if (e.nodeName === 'BUTTON') {

  	//Fetch content from sibling elements
  	var configName = e.previousSibling.previousSibling.innerHTML;
  	var configBody = e.previousSibling.value;

  	socket.send("/updateconfig " + configName + " " + configBody);
  } 
  
}

function deleteConfig(e){
 	//console.log("Deleting config: ");
  e = e || window.event;
  e = e.target || e.srcElement;
  if (e.nodeName === 'A') {

  	//Fetch content from sibling elements
  	var configName = e.previousSibling.previousSibling.previousSibling.innerHTML;
  	var configBody = e.previousSibling.previousSibling.value;

  	//Display warning
  	if (confirm("Are you sure you want to delete " + configName + "?")) {
		  socket.send("/deleteconfig " + configName);
  		console.log(configName + " deleted");
		}

  } 
  
}

document.getElementById("showForm").addEventListener("click", function(){
	var form = document.getElementById("createForm");
	form.style.display = "block";	
});
//Hide form
document.getElementById("cancelCreate").addEventListener("click", function(){
	var form = document.getElementById("createForm");
	form.style.display = "none";	
});

//Create config
function createConfig(e){
	e = e || window.event;
  e = e.target || e.srcElement;
  //console.log(e);
  
	var configName = document.getElementById("name").value;
	var leftscreen = document.getElementById("leftscreen").value;
	var midscreen = document.getElementById("midscreen").value;
	var rightscreen = document.getElementById("rightscreen").value;
	var ledscreen = document.getElementById("ledscreen").value;

	//Check if everything is filled in
	if(configName && leftscreen && midscreen && rightscreen && ledscreen){
		//Check if configname exists
		var existingConfigs = document.getElementsByClassName("confignames");
		//console.log(existingConfigs);
		var exists = false;
		for(var i=0;i<existingConfigs.length;i++){
			if (existingConfigs[i].innerText.toLowerCase() == configName.toLowerCase() + ".json"){
				exists = true;
			}
		}
		if(exists) {
			showMessageBox("Config name already exists!","yellow",3000);
		} else {
			console.log("Creating config: " + configName + ".json");
			//Construct json
			var configBody = "{ \n\
  \"leftscreen\": \"" + leftscreen + "\",\n\
  \"midscreen\": \"" + midscreen + "\",\n\
  \"rightscreen\": \"" + rightscreen + "\",\n\
  \"ledscreen\": \"" + ledscreen + "\"\n\
}";
			console.log(configBody);
			socket.send("/updateconfig " + configName + ".json" + " " + configBody);
			//Hide form
			var form = document.getElementById("createForm");
			form.style.display = "none";	
		}
	} else {
		showMessageBox("Please fill in every field...","yellow",2000);
	}
}

function getConfigs(){
	showMessage = false;
  console.log("Fetching all configs");
  socket.send("/getconfigs");
}

function showConfigs(incomingJson){
	document.getElementById("configs").innerHTML = ""; //Clear html

	//Incoming json:
	var splitted = incomingJson.split("---");
	splitted.pop(); //Remove last array item

	//Parse each json object
	for(var i=0;i<splitted.length;i++){

		var index = splitted[i].indexOf("{");
		var configName = splitted[i].substring(0,index-2);
		var jsonContent = splitted[i].substring(index);

		//Create DOM elements
			var container = document.createElement("div");
			var span = document.createElement("span");
			var textarea = document.createElement("textarea");
			var btn = document.createElement("button");
			var dlt = document.createElement("a");

			container.appendChild(span);
			container.appendChild(textarea);
			container.appendChild(btn);
			container.appendChild(dlt);

			container.className = "container";
			span.innerHTML = configName;
			span.className = "confignames";
			textarea.innerHTML = jsonContent;
			textarea.cols = 100;
			textarea.rows = 6;
			btn.innerHTML = "Update config";
			btn.onclick = generateConfig;
			dlt.innerHTML = "Delete config";
			dlt.onclick = deleteConfig;
			dlt.href = "#";
		//End create DOM elements
		document.getElementById("configs").appendChild(container);

		
	}

	if(showMessage){ //Show message box
		showMessageBox("Configs updated!","lime",2000);
	}

	showMessage = true;
}

setTimeout(function(){ getConfigs(); }, 1000); //Auto load configs

function showMessageBox(message,color,time){
	var messagebox = document.getElementById("messagebox");
	messagebox.innerHTML = message;
	messagebox.style.background = color;
	messagebox.style.display = "inherit";
	window.setTimeout(function() {
          messagebox.style.display = "none";
  }, time);
}