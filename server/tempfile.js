var fs = require("fs"); //Access local filesystem


module.exports = {
    readModules : function(callback) {
        var listing = [];
        fs.readdir("modules",function(err,list) {
            if(err) {
                console.log(err);
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
        var clients = [];
        var addresses = [];
        console.log("Amount of clients: " + info.client_amount);
        for(var i = 0; i < info.client_amount; i++){
            var client = new Client(info.clients[i].name,info.clients[i].address);
            clients.push(client);
        }
        return callback(clients);
    }
};

var temp = require("./tempfile.js");

temp.readAllClients(function(names){
    for(var i = 0 ; i < names.length ; i++){
        console.log(names[i].name + " with IP: " + names[i].address);
    }
});
console.log("---");

temp.readModules(function(list) {
    console.dir(list);
});

function Client(name, address) {
    this.name = name;
    this.address = address;
}