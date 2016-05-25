$(document).ready(function () {
    var j=0;
    while(j<2){
        $("#container").append("<div id='button_"+ j +"' class='button'></div>");
        j++;
    }

    $(".button").throwable({
        gravity:{x:0,y:0.001},
        bounce:0.8,
        impulse:{
            f:100,
            p:{x:3,y:3}
        },
        shape: "circle",
    });
});
