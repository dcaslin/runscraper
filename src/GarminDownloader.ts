import * as puppeteer from "puppeteer";
import * as cliProgress from "cli-progress";

const LOGIN = "https://connect.garmin.com/en-US/signin";
const RUNNING = "https://connect.garmin.com/modern/proxy/activitylist-service/activities/search/activities?activityType=running&limit=1000&start=0";

export default async function downloadData(uid: string, pw: string, debug: boolean, progbar: cliProgress.Bar): Promise<string> {
        const browser = await puppeteer.launch();
        let page = await browser.newPage();

        progbar.update(20);

        await page.goto(LOGIN, {
            timeout: 10000,
            waitUntil: "domcontentloaded"
        });

        progbar.update(30);
        // this is necessary and I have no idea why
        await page.screenshot({ path: "./data/garmin1.png" });
        if (debug) {
            await page.screenshot({ path: "./data/garmin1.png" });
        }

        progbar.update(40);
        const f = await page.$("#gauth-widget-frame-gauth-widget");
        const id = await f.getProperty("src");
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


        if (debug) {
            await page.screenshot({ path: "./data/garmin2.png" });
        }

        await page.click("#username");
        await page.keyboard.type(uid);
        await page.click("#password");
        await page.keyboard.type(pw);

        if (debug) {
            await page.screenshot({ path: "./data/garmin3.png" });
        }
        await page.click("#login-btn-signin");

        progbar.update(80);
        await page.waitForNavigation();

        progbar.update(90);

        if (debug) {
            await page.screenshot({ path: "./data/garmin4.png" });
        }
        progbar.update(100);

        await page.goto(RUNNING);
        const innerText = await page.evaluate(() =>  {
            return document.querySelector("body").innerText;
        });
        progbar.update(150);
        await browser.close();
        return innerText;
    }