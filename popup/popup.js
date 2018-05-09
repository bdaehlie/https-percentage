// UTILITY FUNCTIONS

// Takes an integer percentage value.
function updateHTTPSPercentage(percentage) {
  document.getElementById("https-percentage").innerHTML = percentage.toString() + "% HTTPS";
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
