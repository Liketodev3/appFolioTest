const fs = require('node:fs');
const os = require("node:os");
const puppeteer = require('puppeteer');
const username = os.userInfo().username;

const MEMBERS_COUNT = 2;
const NEXT_PROFILE_INTERVAL = 10;
const profileOrigin = "https://www.linkedin.com/in/";
const profileMessagesOrigin = "https://www.linkedin.com/messaging/thread/2-NTE5ZjEwNjgtg2VjYS00jkzE5LThipzktZDA4MGI5OWM1MmQwXzAxMg==/";
const userDataDir = `C:\\Users\\${username}\\AppData\\Local\\Chromium\\User Data`;

const login = require('../evaluate/login.js');
const getData = require('../evaluate/getData.js');
const findUnreadMessageAndOpen = require('../evaluate/findUnreadMessageAndOpen.js');
const findLastMessage = require('../evaluate/findLastMessage.js');

let Excel = require('exceljs');

function sleep(delay){
    return new Promise(resolve => setTimeout(resolve, delay));
}

function createBrowser(profileName) {
    return puppeteer.launch({
        headless: false, // The browser is visible
        ignoreHTTPSErrors: true,
        // executablePath: "C:/chrome-win/chrome.exe",
        // userDataDir: 'C:/Users/WPPC-0084/AppData/Local/Chromium/User Data',
        // profileDirectory: profileName,
        // args: [
        //     // '--no-sandbox',
        //     '--enable-sync',
        //     `--user-data-dir=${userDataDir}`,
        //     `--profile-directory=${profileName}`
        // ]
    });
}

function getLauncherProfiles(){
    const profiles = [];
    return new Promise(resolve => {
        fs.readFile(userDataDir + '\\Local State', {encoding:'utf8', flag:'r'}, (err, data) => {
            if(err){
                console.log(err);
            }else{
                const localState = JSON.parse(data);
                const profilesInfo = localState?.profile?.info_cache || {};

                for (const [key, value] of Object.entries(profilesInfo)) {
                    profiles.push({
                        folder: key,
                        name: value.name,
                    });
                }
            }

            resolve(profiles);
        });
    });
}

async function createNewPage(browser) {
    const page = await browser.newPage();
    await page.setViewport({
        width: 1920,
        height: 900,
        deviceScaleFactor: 1,
    });

    return page;
}

async function sendLinkedinConnect(profileName, page, analytic, message){
    const members = await httpService.getMembers(MEMBERS_COUNT);
    if (!members.length) throw 'members dont found';

    for(const member of members){
        const profileUrl = profileOrigin + member.profile.split('/in/')[1].split('/')[0] + '/';

        await page.goto(profileUrl, {waitUntil: 'domcontentloaded'});

        const evaluateData = await page.evaluate(sendLinkedinMessages, message);
        if (evaluateData === 'unauthorized') throw `${profileName} unauthorized`;
        if (evaluateData === 'connect-limit-past') throw `${profileName} connect limit past`;
        if (evaluateData === 'message-sent') analytic.messagesSent++;

        await httpService.changeMemberStatusTo('completed', member.id);

        await sleep(NEXT_PROFILE_INTERVAL * 1000);
    }
}

async function answerMessages(page){
    await page.goto(profileMessagesOrigin, {waitUntil: 'domcontentloaded'});

    while(true){
        await sleep(2000);

        const unreadMessageFind = await page.evaluate(findUnreadMessageAndOpen);
        if (!unreadMessageFind) break;

        const lastMessage = await page.evaluate(findLastMessage);

        console.log(lastMessage);
        break;
        if (!lastMessage) continue;

        const answer = await openAIService.ask(lastMessage);
        if (!answer) continue;

        await page.evaluate(answerOpenedConversation, answer);

        await sleep(2000);
    }
}



async function scrollTo(page, count){
    let i = 0;
    while(++i <= count)
        await page.keyboard.press('ArrowDown');
}

function getScrollBottom(){
    const r = document.querySelector('.ScrollbarLayout_face').getBoundingClientRect();
    return r.y;
}


function getPageData(browser, url){
    return new Promise(async resolve => {
        const page = await createNewPage(browser);

        await page.setDefaultNavigationTimeout(0);

        await page.goto(url, {waitUntil: 'domcontentloaded'});

        const evaluateLoginData = await page.evaluate(() => {
            function getFirstTextSent(a){
                for(let i = a.length - 2; i >= 0; --i)
                    if(a[i].querySelector('.activity-log-row__content > span').textContent === 'Text Sent')
                        return a[i].querySelector('.activity-log-row__created-at').textContent;
            }

            function getLastTextSent(a){
                for(let i = 0; i < a.length; ++i)
                    if(a[i].querySelector('.activity-log-row__content > span').textContent === 'Text Sent')
                        return a[i].querySelector('.activity-log-row__created-at').textContent;
            }

            function getLastTextReceived(a){
                for(let i = 0; i < a.length; ++i)
                    if(a[i].querySelector('.activity-log-row__content > span').textContent === 'Text Received')
                        return a[i].querySelector('.activity-log-row__created-at').textContent;
            }

            const cardBody = document.querySelectorAll('.card-body > .activity-log > div');
            const firstMessage = cardBody[cardBody.length-1].querySelector('.activity-log-row__created-at').textContent;
            const firstTextSent = getFirstTextSent(cardBody);
            const lastTextReceived = getLastTextReceived(cardBody);
            const lastTextSent = getLastTextSent(cardBody);

            return {
                name: document.querySelector('H2').textContent.trim(),
                firstMessage: firstMessage,
                firstTextSent: firstTextSent,
                lastTextReceived: lastTextReceived,
                lastTextSent: lastTextSent,
            }
        });

        await page.close();

        resolve(evaluateLoginData);
    });
}


let testii = [];


function test1(pages){
    return new Promise(resolve => {
        Promise.all(pages).then((values) => {
            testii = [...testii, ...values];
            resolve();
        });
    });
}

class appFolioController{
    async start(req, res) {

        const profiles = await getLauncherProfiles();
        if (!profiles) return res.status(400).json({error: "create Chromium profiles"});

        const browser = await createBrowser('Profile 1');
        const page = await createNewPage(browser);

        await page.goto('https://livlavender.appfolio.com/users/sign_in', {waitUntil: 'domcontentloaded'});

        const evaluateLoginData = await page.evaluate(login);

        await page.waitForNavigation({'waitUntil': 'domcontentloaded'});

        await page.goto('https://livlavender.appfolio.com/buffered_reports/guest_card_inquiries?customize=true', {waitUntil: 'domcontentloaded'});

        const evaluateScrapData = await page.evaluate(getData);

        let scrollY = 0;
        while(true){
            const scrollNewY = await page.evaluate(getScrollBottom);

            await scrollTo(page, 10);

            await sleep(1000);

            if(scrollNewY <= scrollY){
                console.log('finish');
                break;
            }

            scrollY = scrollNewY;
        }

        const evaluateScrapData2 = await page.evaluate(() => {
            const data = [];

            window.set.forEach(item => {
                data.push(item);
            });

            return data;
        });


        let i = 0;
        while(i < evaluateScrapData2.length){
            const ps = [];

            for(let j = 0;j < 20 && i < evaluateScrapData2.length; i++, j++)
                ps.push(getPageData(browser, evaluateScrapData2[i]));

            await test1(ps);
        }

        const workbook = new Excel.Workbook();
        const worksheet = workbook.addWorksheet("Sheet 1");

        worksheet.columns = [
            {header: 'NAME', key: 'name', width: 55},
            {header: 'CREATED', key: 'created', width: 55},
            {header: 'FIRST_TEXT_SENT', key: 'firstTextSent', width: 55},
            {header: 'LAST_TEXT_SENT', key: 'lastTextSent', width: 55},
            {header: 'LAST_TEXT_RECEIVED', key: 'lastTextReceived', width: 55},
            {header: 'LAST_TEXT_SENT-LAST_TEXT_RECEIVED', key: 'lastTextSentLastTextReceived', width: 55},
        ];

        function padTo2Digits(num) {
            return num.toString().padStart(2, '0');
        }

        function convertMsToTime(milliseconds) {
            let seconds = Math.floor(milliseconds / 1000);
            let minutes = Math.floor(seconds / 60);
            let hours = Math.floor(minutes / 60);

            seconds = seconds % 60;
            minutes = minutes % 60;
            hours = hours % 24;

            return `${padTo2Digits(hours)}:${padTo2Digits(minutes)}:${padTo2Digits(seconds)}`;
        }


        testii.forEach(function(url){
            let diffTime = '';

            if(url.lastTextReceived){
                let lastSent = new Date(url.lastTextSent).getTime();
                let sent = new Date(new Date().toLocaleString('en-us', {timeZone: 'MST'})).getTime();
                const received = new Date(url.lastTextReceived).getTime();

                if(lastSent > received) sent = lastSent;

                diffTime = convertMsToTime(Math.abs(sent - received));
            }

            worksheet.addRow({
                name: url.name || '',
                created: url.firstMessage || '',
                firstTextSent: url.firstTextSent || '',
                lastTextSent: url.lastTextSent || '',
                lastTextReceived: url.lastTextReceived || '',
                lastTextSentLastTextReceived: diffTime
            });
        });

        await workbook.xlsx.writeFile('./public/filename.xlsx');

        // await browser.close();

        res.render("index", {
            // data: evaluateScrapData
        });
    }


    async createLauncher(req, res){
        const browser = await createBrowser('');

        res.json({test: 'test'});
    }

    async test(req, res){

        const a = await httpService.setBot(macAddress);


        console.log(a);

        res.json({test: 'test'});
    }

}

module.exports = new appFolioController();