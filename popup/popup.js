// UTILITY FUNCTIONS

// Takes an integer percentage value.
function updateHTTPSPercentage(percentage) {
  var string = percentage.toString() + "% HTTPS";
  var element = document.getElementById("https-percentage");
  element.textContent = string;
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
