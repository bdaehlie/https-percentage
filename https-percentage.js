var totalRequests = 0;
var httpsRequests = 0;

function updateUI() {

}

function onHTTPRequest(e) {
  totalRequests++;
  updateUI();
}

function onHTTPSRequest(e) {
  totalRequests++;
  httpsRequests++;
  updateUI();
}

browser.webRequest.onHeadersReceived.addListener(
  onHTTPRequest,
  {urls: ["http://*/*"]}
);

browser.webRequest.onHeadersReceived.addListener(
  onHTTPSRequest,
  {urls: ["https://*/*"]}
);
