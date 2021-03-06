function updateHTTPSPercentage(percentage, req_count, date, topVulnDomains) {
  var percentageStr = percentage.toString();
  var element = document.getElementById("https-percentage");
  element.textContent = percentageStr;

  var reqCountStr = req_count.toLocaleString();
  element = document.getElementById("req-count");
  element.textContent = reqCountStr;

  var dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
  var timeOptions = { hour12: false, hour: 'numeric', minute: 'numeric', timeZoneName: 'short' };
  var dateStr = date.toLocaleDateString('en-us', dateOptions) +
                ", " +
                date.toLocaleTimeString('en-us', timeOptions);
  element = document.getElementById("since-date");
  element.textContent = dateStr;

  element = document.getElementById("vuln-domains-list");
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
  if (topVulnDomains.length == 0) {
    element.appendChild(document.createTextNode("None yet!"));
  } else {
    for (var i = 0; i < topVulnDomains.length; i++) {
      var domain = topVulnDomains[i];
      element.appendChild(document.createTextNode(domain));
      element.appendChild(document.createElement("br"));
    }
  }
}

var messagePort = browser.runtime.connect({name: "HTTPSPercentage"});
function onMessage(msg) {
  if (msg.id == "httpsPercentage") {
    date = new Date(msg.date);
    updateHTTPSPercentage(msg.percentage, msg.req_count, date, msg.topVulnDomains);
  }
}
messagePort.onMessage.addListener(onMessage);
messagePort.postMessage({id: "getHTTPSPercentage", value: null});

function handleResetClick() {
  messagePort.postMessage({id: "resetHTTPSPercentage", value: null});
  updateHTTPSPercentage(0, 0, new Date(), []);
}
document.getElementById("reset-button").onclick = handleResetClick;
