// TODO
// 1) Don't update UI more than once per second
// 2) Display percentage in URL bar
// 3) Persist data across restarts

var totalRequests = 0;
var httpsRequests = 0;

function calculateHTTPSPercentage() {
	if (totalRequests == 0) {
		return 0;
	}
	return ((httpsRequests / totalRequests) * 100).toFixed(0);
}

browser.runtime.onConnect.addListener(function(port) {
    if(port.name == "getHTTPSPercentage") {
      port.postMessage({httpsPercentage: calculateHTTPSPercentage()});
    }
});

function logPercentageToConsole() {
  console.log(calculateHTTPSPercentage().toString() + "% HTTPS!");
}

function onHTTPRequest(e) {
  totalRequests++;
  // logPercentageToConsole();
}

function onHTTPSRequest(e) {
  totalRequests++;
  httpsRequests++;
  // logPercentageToConsole();
}

browser.webRequest.onHeadersReceived.addListener(
  onHTTPRequest,
  {urls: ["http://*/*"]}
);

browser.webRequest.onHeadersReceived.addListener(
  onHTTPSRequest,
  {urls: ["https://*/*"]}
);
