// GLOBAL DATA

var totalRequests = 0;
var httpsRequests = 0;

// UTILITY FUNCTIONS

function calculateHTTPSPercentage() {
  if (totalRequests == 0) {
    return 0;
  }
  return ((httpsRequests / totalRequests) * 100).toFixed(0);
}

function logPercentageToConsole() {
  console.log(calculateHTTPSPercentage().toString() + "% HTTPS!");
}

function saveData() {
  browser.storage.local.set({totalRequests: totalRequests, httpsRequests: httpsRequests});
}

// RESTORE DATA

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

// [BROKEN] IDLE STATE DETECTION AND DATA SAVE

function newIdleState(state) {
  if (state == "idle") {
    saveData();
  }
}
browser.idle.onStateChanged.addListener(newIdleState);

browser.runtime.onConnect.addListener(function(port) {
  if(port.name == "getHTTPSPercentage") {
    port.postMessage({httpsPercentage: calculateHTTPSPercentage()});
    saveData(); // This can go away when idle detection works!
  }
});

// HTTPS STAT COLLECTION

function onHTTPRequest(e) {
  totalRequests++;
}
browser.webRequest.onHeadersReceived.addListener(
  onHTTPRequest,
  {urls: ["http://*/*"]}
);

function onHTTPSRequest(e) {
  totalRequests++;
  httpsRequests++;
}
browser.webRequest.onHeadersReceived.addListener(
  onHTTPSRequest,
  {urls: ["https://*/*"]}
);
