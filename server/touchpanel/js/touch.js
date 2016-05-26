$(document).ready(function () {

  var colors = ["bgBlue","bgGreen","bgPink","bgOrange","bgPurple"];

  function drag(e) {
      e.dataTransfer.setData("text", e.target.dataset.id);
  }

  var j=0;
  while(j<1){
    $("#container").append("<div draggable='true' ondragstart='alert(\"test\")' id='button_"+ j +"' class='button " + colors[j % colors.length] + "'>Button " + j + "</div>");
    j++;
  }

  $(".button").throwable({
    gravity:{x:0,y:0},
    bounce:1,
    impulse:{
      f:100,
      p:{x:3,y:3}
    },
    shape: "circle"
  });

  $( ".button" ).draggable();

  $( "#area" ).droppable({
     drop: function( event, ui ) {
       console.log("dropped")
     }
   });});

$(document).on("inarea",function (event,data){
    $("#area").css("background-color","blue");
});

$(document).on("outarea",function (event,data){
    $("#area").css("background-color","black");
});
