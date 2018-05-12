// GLOBAL DATA

var totalRequests = 0;
var httpsRequests = 0;
var sinceDate = new Date();

var httpDomainCountMap = new Map();
var topHTTPDomains = new Object();

// UTILITY FUNCTIONS

function calculateHTTPSPercentage() {
  if (totalRequests == 0) {
    return 0;
  }
  return ((httpsRequests / totalRequests) * 100).toFixed(0);
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
                           date: sinceDate,
                 topVulnDomains: ["pbskids.org", "espn.com"]});
    saveData(); // Save data whenever user looks at it

    // For now print this out to console. Eventually we will
    // return this to the popup and display there.
    for (d in topHTTPDomains) {
      console.log("Top HTTP domain: " + d);
    }
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

// TRACK TOP HTTP SITES

function updateHTTPDomainCount(domain) {
  // Update map containing count for this domain.
  var count = 1;
  if (httpDomainCountMap.has(domain)) {
    count = httpDomainCountMap.get(domain) + 1;
    httpDomainCountMap.set(domain, count)
  } else {
    httpDomainCountMap.set(domain, 1);
  }

  // If fewer than 10 top domains just add to list.
  if (Object.keys(topHTTPDomains).length < 10) {
    topHTTPDomains[domain] = count;
    return;
  }

  // Find lowest count in top domains.
  var topDomains = Object.keys(topHTTPDomains);
  var lowestTopDomain = topDomains[0];
  var lowestTopDomainCount = topHTTPDomains[lowestTopDomain];
  for (d in topDomains) {
    if (topHTTPDomains[d] < lowestTopDomainCount) {
      lowestTopDomain = d;
      lowestTopDomainCount = topHTTPDomains[d];
    }
  }

  // If new top domain replace the old one.
  if (count > lowestTopDomainCount) {
    delete topHTTPDomains[lowestTopDomain];
    topHTTPDomains[domain] = count;
  }
}

// HTTPS STAT COLLECTION

function onHTTPRequest(e) {
  totalRequests++;
  var url = new URL(e.url);
  updateHTTPDomainCount(url.hostname);
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
