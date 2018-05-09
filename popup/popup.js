// UTILITY FUNCTIONS

// Takes an integer percentage value.
function updateHTTPSPercentage(percentage) {
  var string = percentage.toString() + "% HTTPS";
  var olddiv = document.getElementById("https-percentage");

  var newdiv = document.createElement('div');
  newdiv.class = "stat";
  newdiv.id = "https-percentage";
  newdiv.innerHTML = string;

  document.body.replaceChild(newdiv, olddiv);
}

// MESSAGE HANDLING

var messagePort = browser.runtime.connect({name: "HTTPSPercentage"});
function onMessage(msg) {
  if (msg.id == "httpsPercentage") {
    updateHTTPSPercentage(msg.value);
  }
}
messagePort.onMessage.addListener(onMessage);

// GET HTTPS PERCENTAGE

messagePort.postMessage({id: "getHTTPSPercentage", value: null});

// RESET BUTTON

function handleResetClick() {
  messagePort.postMessage({id: "resetHTTPSPercentage", value: null});
  updateHTTPSPercentage(0);
}
document.getElementById("reset-button").onclick = handleResetClick;
