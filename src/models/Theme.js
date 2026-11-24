var storageKey = 'site-theme'

function currentTheme() {
    return document.documentElement.getAttribute('data-theme') || 'light'
}

function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme)

    var themeColor = document.querySelector('meta[name="theme-color"]')
    if (themeColor) {
        themeColor.setAttribute('content', theme == 'dark' ? '#12161c' : '#ffffff')
    }
}

module.exports = {
    current: currentTheme,
    toggle: function () {
        var nextTheme = currentTheme() == 'dark' ? 'light' : 'dark'
        applyTheme(nextTheme)

        try {
            window.localStorage.setItem(storageKey, nextTheme)
        } catch (error) {
            // The selected theme still applies when storage is unavailable.
        }
    }
}
