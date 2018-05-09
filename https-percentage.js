var totalRequests = 0;
var httpsRequests = 0;

function logPercentageToConsole() {
  console.log(calculateHTTPSPercentage().toString() + "% HTTPS!");
}

function saveData() {
  browser.storage.local.set({totalRequests: totalRequests, httpsRequests: httpsRequests});
}

function readSavedData(result) {
  if (result.totalRequests && result.httpsRequests) {
    totalRequests = result.totalRequests;
    httpsRequests = result.httpsRequests;
  } else {
    totalRequests = 0;
    httpsRequests = 0;
  }
}
function onDataReadError(error) {
  console.log(`Error: ${error}`);
}
var savedDataGetting = browser.storage.local.get();
savedDataGetting.then(readSavedData, onDataReadError);

// This idle event detection doesn't appear to work!
function newIdleState(state) {
  if (state == "idle") {
    saveData();
  }
}
browser.idle.onStateChanged.addListener(newIdleState);

function calculateHTTPSPercentage() {
  if (totalRequests == 0) {
    return 0;
  }
  return ((httpsRequests / totalRequests) * 100).toFixed(0);
}

browser.runtime.onConnect.addListener(function(port) {
  if(port.name == "getHTTPSPercentage") {
    port.postMessage({httpsPercentage: calculateHTTPSPercentage()});
    saveData(); // This can go away when idle detection works!
  }
});

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
