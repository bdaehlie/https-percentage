// GLOBAL DATA

var totalRequests = 0;
var httpsRequests = 0;
var sinceDate = new Date();

var httpDomainCountMap = new Map();
var topVulnDomains = [];

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
                 topVulnDomains: topVulnDomains});
    saveData(); // Save data whenever user looks at it
  }
  else if (msg.id == "resetHTTPSPercentage") {
    totalRequests = 0;
    httpsRequests = 0;
    sinceDate = new Date();
    httpDomainCountMap = new Map();
    topVulnDomains = [];
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

  // Don't do anything else if domain is already in top list.
  for (var i = 1; i < topVulnDomains.length; i++) {
    if (domain == topVulnDomains[i]) {
      return;
    }
  }

  // If fewer than 10 top domains just add to list.
  if (topVulnDomains.length < 10) {
    topVulnDomains.push(domain);
    return;
  }

  // Find lowest count in top domains.
  var lowestTopDomainIndex = 0;
  var lowestTopDomain = topVulnDomains[lowestTopDomainIndex];
  var lowestTopDomainCount = httpDomainCountMap[lowestTopDomain];
  for (var i = 1; i < topVulnDomains.length; i++) {
    currentDomain = topVulnDomains[i];
    currentDomainCount = httpDomainCountMap[currentDomain];
    if (currentDomainCount < lowestTopDomainCount) {
      lowestTopDomainIndex = i;
      lowestTopDomain = currentDomain;
      lowestTopDomainCount = currentDomainCount;
    }
  }

  // If new top domain replace the old one...
  if (count > lowestTopDomainCount) {
    topVulnDomains[lowestTopDomainIndex] = domain;
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
