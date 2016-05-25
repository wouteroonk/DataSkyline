var fs = require("fs"); //Access local filesystem


module.exports = {
    readModules : function(callback) {
        var listing = [];
        fs.readdir("modules",function(err,list) {
            if(err) {
                console.log("Error");
            } else {
                for(var i = 0 ; i < list.length; i++) {
                    var item = list[i];
                    if(fs.lstatSync("modules/"+item).isDirectory()){
                        listing.push(item);
                    }
                }
            }
            return callback(listing);
        });
    },

    readAllClients : function(callback) {
        var info = require("./assets/info.json");
        var names = [];
        var addresses = [];
        console.log("Amount of clients: " + info.client_amount);
        for(var i = 0; i < info.client_amount; i++){
            names.push(info.clients[i].name);
            addresses.push(info.clients[i].address);
            //.log(info.clients[i].name + " With IP: " + info.clients[i].address);
        }
        return callback(names,addresses);
    }
};

var temp = require("./tempfile.js");

temp.readAllClients(function(names,addresses){
    console.dir(names);
    console.dir(addresses);
});
console.log("---");

temp.readModules(function(list) {
    console.dir(list);
});