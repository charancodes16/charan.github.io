document.addEventListener("DOMContentLoaded", async () => {
  const clipBtn = document.getElementById("clipBtn")
  const tagsInput = document.getElementById("tagsInput")
  const notesInput = document.getElementById("notesInput")
  const pageTitle = document.getElementById("pageTitle")
  const pageUrl = document.getElementById("pageUrl")
  const bookmarksList = document.getElementById("bookmarksList")
  const successMessage = document.getElementById("successMessage")

  // Get current tab info
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })

  pageTitle.textContent = tab.title
  pageUrl.textContent = tab.url

  // Load recent bookmarks
  loadRecentBookmarks()

  clipBtn.addEventListener("click", async () => {
    clipBtn.disabled = true
    clipBtn.textContent = "Clipping..."

    try {
      // Extract content from the page
      const [result] = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: extractPageContent,
      })

      const pageContent = result.result

      // Create bookmark object
      const bookmark = {
        id: Date.now().toString(),
        title: tab.title,
        url: tab.url,
        content: pageContent,
        tags: tagsInput.value
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag),
        notes: notesInput.value,
        timestamp: new Date().toISOString(),
        favicon: tab.favIconUrl,
      }

      // Save to storage
      const { bookmarks = [] } = await chrome.storage.local.get(["bookmarks"])
      bookmarks.unshift(bookmark)

      // Keep only last 100 bookmarks
      if (bookmarks.length > 100) {
        bookmarks.splice(100)
      }

      await chrome.storage.local.set({ bookmarks })

      // Show success message
      successMessage.style.display = "block"
      setTimeout(() => {
        successMessage.style.display = "none"
      }, 2000)

      // Clear inputs
      tagsInput.value = ""
      notesInput.value = ""

      // Reload bookmarks list
      loadRecentBookmarks()
    } catch (error) {
      console.error("Error clipping page:", error)
      alert("Error clipping page. Please try again.")
    }

    clipBtn.disabled = false
    clipBtn.textContent = "🔖 Clip This Page"
  })

  async function loadRecentBookmarks() {
    const { bookmarks = [] } = await chrome.storage.local.get(["bookmarks"])

    bookmarksList.innerHTML = ""

    bookmarks.slice(0, 5).forEach((bookmark) => {
      const item = document.createElement("div")
      item.className = "bookmark-item"
      item.innerHTML = `
        <div class="bookmark-title">${bookmark.title}</div>
        <div class="bookmark-url">${new URL(bookmark.url).hostname}</div>
      `

      item.addEventListener("click", () => {
        chrome.tabs.create({ url: bookmark.url })
      })

      bookmarksList.appendChild(item)
    })

    if (bookmarks.length === 0) {
      bookmarksList.innerHTML =
        '<div style="color: #666; font-size: 12px; text-align: center; padding: 20px;">No clips yet</div>'
    }
  }
})

// Function to extract content from the page
function extractPageContent() {
  const content = {
    title: document.title,
    url: window.location.href,
    description: "",
    text: "",
    images: [],
    links: [],
  }

  // Get meta description
  const metaDescription = document.querySelector('meta[name="description"]')
  if (metaDescription) {
    content.description = metaDescription.getAttribute("content")
  }

  // Extract main text content
  const article =
    document.querySelector("article") ||
    document.querySelector("main") ||
    document.querySelector(".content") ||
    document.querySelector("#content") ||
    document.body

  if (article) {
    // Remove script and style elements
    const scripts = article.querySelectorAll("script, style, nav, header, footer")
    scripts.forEach((el) => el.remove())

    content.text = article.innerText.substring(0, 5000) // Limit to 5000 chars
  }

  // Extract images
  const images = document.querySelectorAll("img")
  images.forEach((img) => {
    if (img.src && img.alt) {
      content.images.push({
        src: img.src,
        alt: img.alt,
      })
    }
  })

  // Extract important links
  const links = document.querySelectorAll("a[href]")
  const importantLinks = []
  links.forEach((link) => {
    if (link.href.startsWith("http") && link.textContent.trim()) {
      importantLinks.push({
        url: link.href,
        text: link.textContent.trim(),
      })
    }
  })
  content.links = importantLinks.slice(0, 10) // Limit to 10 links

  return content
}
