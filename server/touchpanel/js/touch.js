$(document).ready(function() {

    //Default colours of the dataskyline
    var colors = ["bgBlue", "bgGreen", "bgPink", "bgOrange", "bgPurple"];

    //Temp buttons for demo
    var buttons = ["Verkeer", "Weer", "Bezoekers", "Nieuws"];

    //Create buttons
    var j = 0;
    while (j < buttons.length) {
        $("#container").append("<div id='button_" + j + "' class='button " + colors[j % colors.length] + "'>" + buttons[j] + "</div>");
        j++;
    }

    //Activate the first button
    $(".button").first().addClass("active");

    //Make the buttons throwable (moveable)
    $(".button").throwable({
        gravity: {
            x: 0,
            y: 0
        },
        bounce: 1,
        impulse: {
            f: 100,
            p: {
                x: 3,
                y: 3
            }
        },
        shape: "circle"
    });

    //Button click
    $(".button").click(function() {

        $(".active").removeClass("active")
        $(this).addClass("active");
    });

});
