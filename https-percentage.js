// GLOBAL DATA

var totalRequests = 0;
var httpsRequests = 0;
var sinceDate = new Date();

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
  browser.storage.local.set({totalRequests: totalRequests,
                             httpsRequests: httpsRequests,
                                 sinceDate: sinceDate});
}

// RESTORE DATA

function readSavedData(result) {
  if (result.totalRequests && result.httpsRequests && result.sinceDate) {
    totalRequests = result.totalRequests;
    httpsRequests = result.httpsRequests;
    sinceDate = new Date(result.sinceDate);
  }
}
function onDataReadError(error) {
  console.log(`Error: ${error}`);
}
var savedDataGetting = browser.storage.local.get();
savedDataGetting.then(readSavedData, onDataReadError);

// IDLE STATE DETECTION AND DATA SAVE

function newIdleState(state) {
  if (state == "idle") {
    saveData();
  }
}
browser.idle.setDetectionInterval(15);
browser.idle.onStateChanged.addListener(newIdleState);

// MESSAGE HANDLING

var messagePort = null;

function onMessage(msg) {
  if(msg.id == "getHTTPSPercentage") {
    messagePort.postMessage({id: "httpsPercentage",
                     percentage: calculateHTTPSPercentage(),
                      req_count: totalRequests,
                           date: sinceDate});
    saveData(); // Save data whenever user looks at it
  }
  else if (msg.id == "resetHTTPSPercentage") {
    totalRequests = 0;
    httpsRequests = 0;
    sinceDate = new Date();
    saveData();
  }
}

function onPortConnect(port) {
  messagePort = port;
  messagePort.onMessage.addListener(onMessage);
}
browser.runtime.onConnect.addListener(onPortConnect);

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
