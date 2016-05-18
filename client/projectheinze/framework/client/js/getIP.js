//Function to retrieve current screen
function getScreen(ip) {
  console.log("Current ip: " + ip);
  var lastIP = ip.split('.')[3]; //Stores last part of IP to identify node
  switch(lastIP) {
    case "999":
        currentScreen = "right";
        break;
    case "137":
        currentScreen = "left";
        break;
    case "999":
        currentScreen = "mid";
        break;
    case "999":
        currentScreen = "led";
        break;
    case "100":
        currentScreen = "touch";
        break;
    default:
        console.warn("Error: Unknown IP address: " + ip);
  }
  init(); //Init after we retrieved IP
}

//Magic stuff, do not touch :)
function findIP(addIP) { //  onNewIp - your listener function for new IPs
  var myPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection; //compatibility for firefox and chrome
  var pc = new myPeerConnection({iceServers: []}),
    noop = function() {},
    localIPs = {},
    ipRegex = /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/g,
    key;

  function ipIterate(ip) {
    if (!localIPs[ip]) getScreen(ip);
    localIPs[ip] = true;
  }
  pc.createDataChannel(""); //create a bogus data channel
  pc.createOffer(function(sdp) {
    sdp.sdp.split('\n').forEach(function(line) {
      if (line.indexOf('candidate') < 0) return;
      line.match(ipRegex).forEach(ipIterate);
    });
    pc.setLocalDescription(sdp, noop, noop);
  }, noop); // create offer and set local description
  pc.onicecandidate = function(ice) { //listen for candidate events
    if (!ice || !ice.candidate || !ice.candidate.candidate || !ice.candidate.candidate.match(ipRegex)) return;
    ice.candidate.candidate.match(ipRegex).forEach(ipIterate);
  };
}