var fs = require("fs"); //Access local filesystem

module.exports = {
    readModules : function() {
        fs.readdir("modules",function(err,list) {
            if(err) {
                console.log("Error");
            } else {
                for(i = 0 ; i < list.length; i++) {
                    var item = list[i];
                    if(fs.lstatSync("modules/"+item).isDirectory()){
                        console.log(item);
                    }
                }
            }
        });
    }
}

var temp = require("./tempfile.js");
temp.readModules();