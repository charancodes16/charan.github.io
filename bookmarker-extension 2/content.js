// Content script for page interaction
;(() => {
  // Add visual feedback when extension is active
  let isHighlighting = false

  // Listen for messages from popup
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "highlight") {
      toggleHighlighting()
      sendResponse({ success: true })
    }
  })

  function toggleHighlighting() {
    isHighlighting = !isHighlighting

    if (isHighlighting) {
      document.body.style.cursor = "crosshair"
      addHighlightListeners()
    } else {
      document.body.style.cursor = "default"
      removeHighlightListeners()
      clearHighlights()
    }
  }

  function addHighlightListeners() {
    document.addEventListener("mouseover", highlightElement)
    document.addEventListener("mouseout", unhighlightElement)
    document.addEventListener("click", selectElement)
  }

  function removeHighlightListeners() {
    document.removeEventListener("mouseover", highlightElement)
    document.removeEventListener("mouseout", unhighlightElement)
    document.removeEventListener("click", selectElement)
  }

  function highlightElement(e) {
    if (isHighlighting) {
      e.target.classList.add("clip-highlight")
    }
  }

  function unhighlightElement(e) {
    if (isHighlighting) {
      e.target.classList.remove("clip-highlight")
    }
  }

  function selectElement(e) {
    if (isHighlighting) {
      e.preventDefault()
      e.stopPropagation()

      const element = e.target
      const content = element.innerText || element.textContent

      // Send selected content back to popup
      chrome.runtime.sendMessage({
        action: "contentSelected",
        content: content,
        html: element.outerHTML,
      })

      toggleHighlighting()
    }
  }

  function clearHighlights() {
    const highlighted = document.querySelectorAll(".clip-highlight")
    highlighted.forEach((el) => el.classList.remove("clip-highlight"))
  }
})()
