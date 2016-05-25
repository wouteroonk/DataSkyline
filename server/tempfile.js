var fs = require("fs"); //Access local filesystem
var pathing = require("path");

function Client(name, address) {
    this.name = name;
    this.address = address;
}
module.exports = {
    readDirs : function(path, callback) {
        var listing = [];
        fs.readdir(path,function(err,list) {
            if(err) {
                console.log(err);
            } else {
                for(var i = 0 ; i < list.length; i++) {
                    var item = list[i];
                    if(fs.lstatSync(path+"/"+item).isDirectory()){
                        listing.push(item);
                    }
                }
            }
            return callback(listing);
        });
    },
    readViewInfo : function(callback, moduleName) {
        var infoObjects = [];
        var views = [];
        fs.readdir(moduleName, function(err, list){
            if(err){
                console.log("Error")
            } else {
                for(var i = 0; i < list.length; i++) {
                    var item = list[i];
                    if(fs.lstatSync("modules/" + moduleName + "/" + item).isDirectory()) {
                        views.push(item);
                    }
                }
            }
            for(i = 0; i < views.length; i++) {
                var view = views[i];
                var info = require(".modules/" + moduleName + "/" + view + "/info.json");
                infoObjects.push(info);
            }
            return callback(infoObjects);
        });
    },
    readAllClients : function(callback) {
        var info = require("./assets/info.json");
        var clients = [];
        console.log("Amount of clients: " + info.client_amount);
        for (var i = 0; i < info.client_amount; i++) {
            var client = new Client(info.clients[i].name, info.clients[i].address);
            clients.push(client);
        }
        return callback(clients);
    },
    readJsonFile : function(path,filename, callback) {
        var listing;
        fs.readdir(path,function(err,list) {
            if(err) {
                console.log(err);
            } else {
                for(var i = 0 ; i < list.length; i++) {
                    if(list[i] === filename){
                        var file = fs.readFileSync(path+"/"+list[i]);
                        var json = JSON.parse(file);
                        listing = json;
                    }
                }
            }
            return callback(listing);
        });
    }
};

var temp = require("./tempfile.js");

temp.readDirs("modules",function(output) {
    console.dir(output);
});

temp.readDirs("modules/com.example.twitter", function(output){
    console.dir(output);
});

temp.readJsonFile("modules/com.example.twitter","info.json", function(output){
    console.dir(output);
});

temp.readDirs("modules/com.example.twitter/tweetbox", function(output){
    console.dir(output);
});