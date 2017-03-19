window.addEventListener("message", function(event) {
  console.debug("content script", "message", event);
  chrome.runtime.sendMessage(event.data);
});
