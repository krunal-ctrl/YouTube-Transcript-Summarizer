console.log("popup.js runs");

document.addEventListener("DOMContentLoaded", function () {
  document.querySelector("button").addEventListener("click", initializeSummary);
});

function initializeSummary() {
  chrome.runtime.sendMessage({ action: "initializeSummary" }, (response) => {
    return Promise.resolve("Dummy response to keep the console quiet");
  });
}

chrome.extension.onMessage.addListener(function (msg, sender, sendResponse) {
  if (msg.action == "respondToButton") {
    document.getElementById("text-out").innerHTML = msg.result;
  }
});
