const puppeteer = require('puppeteer');
const userDataDir = `C:\\Users\\${username}\\AppData\\Local\\Chromium\\User Data`;

class PuppeteerService{
    createBrowser(profileName) {
        return puppeteer.launch({
            headless: false, // The browser is visible
            ignoreHTTPSErrors: true,
            // executablePath: "C:/chrome-win/chrome.exe",
            // userDataDir: 'C:/Users/WPPC-0084/AppData/Local/Chromium/User Data',
            // profileDirectory: profileName,
            args: [
                // '--no-sandbox',
                '--enable-sync',
                `--user-data-dir=${userDataDir}`,
                `--profile-directory=${profileName}`
            ]
        });
    }

    static async createNewPage(browser) {
        const page = await browser.newPage();
        await page.setViewport({
            width: 1920,
            height: 900,
            deviceScaleFactor: 1,
        });

        return page;
    }
}

module.exports = new PuppeteerService();