// Background script for the extension
chrome.runtime.onInstalled.addListener(() => {
  console.log("Tool Bookmarker extension installed")
})

// Handle context menu (optional)
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "clipPage",
    title: "Clip this page",
    contexts: ["page"],
  })
})

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "clipPage") {
    chrome.action.openPopup()
  }
})

// Handle keyboard shortcuts (optional)
chrome.commands.onCommand.addListener((command) => {
  if (command === "clip-page") {
    chrome.action.openPopup()
  }
})
