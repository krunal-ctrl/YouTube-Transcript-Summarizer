"user strict";
console.log("background.js runs");

var prevUrl = "";
var prevSummary = "";

chrome.extension.onMessage.addListener(function (msg, sender, sendResponse) {
  if (msg.action == "initializeSummary") {
    chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
      if (tabs[0] == null) {
        chrome.runtime.sendMessage({
          action: "respondToButton",
          result: "Not a YouTube video",
        });
        return;
      }

      var videoId = tabs[0].url.match("(?<=watch[?]v=).{11}");
      if (videoId != null) {
        console.log(videoId[0]);
        isCaptionAvailable(videoId[0]);
      } else {
        chrome.runtime.sendMessage({
          action: "respondToButton",
          result: "Not a youtube video",
        });
      }
    });
  }
});

function isCaptionAvailable(videoId) {
  var oReq = new XMLHttpRequest();
  oReq.open("GET", "http://127.0.0.1:5000/api/check?video_id=" + videoId, true);
  oReq.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      var json = oReq.responseText;
      if (json != "") {
        chrome.tabs.query(
          { active: true, currentWindow: true },
          function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {
              action: "startLoadingWindow",
            });
          }
        );
        getSummary(videoId);
      } else {
        chrome.runtime.sendMessage({
          action: "respondToButton",
          result: "No caption available",
        });
      }
    }
  };
  oReq.send();
}

function getSummary(videoId) {
  var oReq = new XMLHttpRequest();
  oReq.open("GET", "http://127.0.0.1:5000/api/summarize", true);
  console.log("Starting to obtain summary");
  oReq.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      var json = this.responseText;
      const regex = /\\n|\\r\\n|\\n\\r|\\r/g;
      json.replace(regex, "<br>");
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: "obtainedSummary",
          result: json,
          vidId: videoId,
        });
      });
    }
  };
  oReq.send();
}
