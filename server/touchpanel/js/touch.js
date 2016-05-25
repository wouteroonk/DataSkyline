$(document).ready(function () {

  var colors = ["bgBlue","bgGreen","bgPink","bgOrange","bgPurple"];

  var j=0;
  while(j<4){
    $("#container").append("<div id='button_"+ j +"' class='button " + colors[j % colors.length] + "'>Button " + j + "</div>");
    j++;
  }

  $(".button").throwable({
    gravity:{x:0,y:0},
    bounce:1,
    impulse:{
      f:100,
      p:{x:3,y:3}
    },
    shape: "circle",
  });
});
