var port = browser.runtime.connect({name: "getHTTPSPercentage"});

port.onMessage.addListener(function(msg) {
    document.getElementById("https-percentage").innerHTML = msg.httpsPercentage.toString() + "% HTTPS";
});
