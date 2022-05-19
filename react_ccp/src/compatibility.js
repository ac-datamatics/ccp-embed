/**
 * Checks if user can use the CCP in current browser. Alerts user if not.
 */
function isBrowserCompatible() {
    const browser = navigator.userAgent;
    if (!browser.includes('Chrome') && !browser.includes('Firefox')) {
        alert("Sorry, browser not supported. Please switch to one of the three latest versions of Chrome or Firefox.");
        return false;
    }
    return true;
}