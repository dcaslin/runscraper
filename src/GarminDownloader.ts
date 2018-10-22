import * as puppeteer from "puppeteer";
import * as cliProgress from "cli-progress";

const LOGIN = "https://connect.garmin.com/en-US/signin";
const RUNNING = "https://connect.garmin.com/modern/proxy/activitylist-service/activities/search/activities?activityType=running&limit=1000&start=0";
const WEIGHT = "https://connect.garmin.com/modern/proxy/userprofile-service/userprofile/personal-information/weightWithOutbound/filterByDay?from=" +
    new Date("January 1, 2010 00:00:00").getTime() + "&until=" + new Date().getTime() + "&_=1529325127976";
const LIFTING = "https://connect.garmin.com/modern/proxy/activitylist-service/activities/search/activities?search=Lifting&limit=2000&start=0";

async function loadJsonData(page: puppeteer.Page, url: string): Promise<string> {
    await page.goto(url);
    // wait on body
    const z = await page.waitForSelector("body");
    return page.evaluate(() => {
        return document.querySelector("body").innerText;
    });
}

export default async function downloadData(uid: string, pw: string, debug: boolean, progbar: cliProgress.Bar): Promise<string[]> {
    const browser = await puppeteer.launch();
    try {

        // get logon page
        let page = await browser.newPage();
        progbar.update(20);
        await page.goto(LOGIN, {
            timeout: 10000,
            waitUntil: "domcontentloaded"
        });
        progbar.update(30);
        const f = await page.waitForSelector("#gauth-widget-frame-gauth-widget");
        progbar.update(40);
        const id = await f.getProperty("src");
        // grab iframe URL and load it directly for simplicity sake
        const url = await id.jsonValue();
        if (debug) {
            console.log(url);
        }
        progbar.update(50);
        page = await browser.newPage();
        progbar.update(60);
        await page.goto(url, {
            timeout: 10000,
            waitUntil: "domcontentloaded"
        });
        progbar.update(70);

        // fill in uid and pw
        await page.click("#username");
        await page.keyboard.type(uid);
        await page.click("#password");
        await page.keyboard.type(pw);
        if (debug) {
            await page.screenshot({ path: "./data/garmin1.png" });
        }
        // click logon button
        await page.click("#login-btn-signin");
        progbar.update(80);
        // wait for the page to navigate AND the connect container to show up
        await page.waitForNavigation();
        progbar.update(90);
        const m = await page.waitForSelector(".connect-container");
        progbar.update(100);

        // We're logged in now and can scrape our JSON
        const innerText = await loadJsonData(page, RUNNING);
        progbar.update(150);
        const innerText2 = await loadJsonData(page, WEIGHT);
        progbar.update(175);
        const innerText3 = await loadJsonData(page, LIFTING);
        progbar.update(185);
        return [innerText, innerText2, innerText3];
    }
    finally {
        await browser.close();

    }
}