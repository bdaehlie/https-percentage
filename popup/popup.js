// UTILITY FUNCTIONS

// Takes an integer percentage value, integer conn_count, Date object
function updateHTTPSPercentage(percentage, conn_count, date) {
  var percentageStr = percentage.toString();
  var element = document.getElementById("https-percentage");
  element.textContent = percentageStr;

  var connCountStr = conn_count.toString();
  element = document.getElementById("conn-count");
  element.textContent = connCountStr;

  var dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
  var timeOptions = { hour12: false, hour: 'numeric', minute: 'numeric', timeZoneName: 'short' };
  var dateStr = date.toLocaleDateString('en-us', dateOptions) +
                " at " +
                date.toLocaleTimeString('en-us', timeOptions);
  element = document.getElementById("since-date");
  element.textContent = dateStr;
}

// MESSAGE HANDLING

var messagePort = browser.runtime.connect({name: "HTTPSPercentage"});
function onMessage(msg) {
  if (msg.id == "httpsPercentage") {
    updateHTTPSPercentage(msg.value, 65, new Date());
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
