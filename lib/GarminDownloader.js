"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var puppeteer = __importStar(require("puppeteer"));
var LOGIN = "https://connect.garmin.com/en-US/signin";
var RUNNING = "https://connect.garmin.com/modern/proxy/activitylist-service/activities/search/activities?activityType=running&limit=1000&start=0";
var WEIGHT = "https://connect.garmin.com/modern/proxy/userprofile-service/userprofile/personal-information/weightWithOutbound/filterByDay?from=" +
    new Date("January 1, 2010 00:00:00").getTime() + "&until=" + new Date().getTime() + "&_=1529325127976";
var LIFTING = "https://connect.garmin.com/modern/proxy/activitylist-service/activities/search/activities?search=Lifting&limit=2000&start=0";
function loadJsonData(page, url) {
    return __awaiter(this, void 0, void 0, function () {
        var z;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, page.goto(url)];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, page.waitForSelector("body")];
                case 2:
                    z = _a.sent();
                    return [2 /*return*/, page.evaluate(function () {
                            return document.querySelector("body").innerText;
                        })];
            }
        });
    });
}
function downloadData(uid, pw, debug, progbar) {
    return __awaiter(this, void 0, void 0, function () {
        var browser, page, f, id, url, m, innerText, innerText2, innerText3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, puppeteer.launch()];
                case 1:
                    browser = _a.sent();
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, , 22, 24]);
                    return [4 /*yield*/, browser.newPage()];
                case 3:
                    page = _a.sent();
                    progbar.update(20);
                    return [4 /*yield*/, page.goto(LOGIN, {
                            timeout: 10000,
                            waitUntil: "domcontentloaded"
                        })];
                case 4:
                    _a.sent();
                    progbar.update(30);
                    return [4 /*yield*/, page.waitForSelector("#gauth-widget-frame-gauth-widget")];
                case 5:
                    f = _a.sent();
                    progbar.update(40);
                    return [4 /*yield*/, f.getProperty("src")];
                case 6:
                    id = _a.sent();
                    return [4 /*yield*/, id.jsonValue()];
                case 7:
                    url = _a.sent();
                    if (debug) {
                        console.log(url);
                    }
                    progbar.update(50);
                    return [4 /*yield*/, browser.newPage()];
                case 8:
                    page = _a.sent();
                    progbar.update(60);
                    return [4 /*yield*/, page.goto(url, {
                            timeout: 10000,
                            waitUntil: "domcontentloaded"
                        })];
                case 9:
                    _a.sent();
                    progbar.update(70);
                    // fill in uid and pw
                    return [4 /*yield*/, page.click("#username")];
                case 10:
                    // fill in uid and pw
                    _a.sent();
                    return [4 /*yield*/, page.keyboard.type(uid)];
                case 11:
                    _a.sent();
                    return [4 /*yield*/, page.click("#password")];
                case 12:
                    _a.sent();
                    return [4 /*yield*/, page.keyboard.type(pw)];
                case 13:
                    _a.sent();
                    if (!debug) return [3 /*break*/, 15];
                    return [4 /*yield*/, page.screenshot({ path: "./data/garmin1.png" })];
                case 14:
                    _a.sent();
                    _a.label = 15;
                case 15: 
                // click logon button
                return [4 /*yield*/, page.click("#login-btn-signin")];
                case 16:
                    // click logon button
                    _a.sent();
                    progbar.update(80);
                    // wait for the page to navigate AND the connect container to show up
                    return [4 /*yield*/, page.waitForNavigation()];
                case 17:
                    // wait for the page to navigate AND the connect container to show up
                    _a.sent();
                    progbar.update(90);
                    return [4 /*yield*/, page.waitForSelector(".connect-container")];
                case 18:
                    m = _a.sent();
                    progbar.update(100);
                    return [4 /*yield*/, loadJsonData(page, RUNNING)];
                case 19:
                    innerText = _a.sent();
                    progbar.update(150);
                    return [4 /*yield*/, loadJsonData(page, WEIGHT)];
                case 20:
                    innerText2 = _a.sent();
                    progbar.update(175);
                    return [4 /*yield*/, loadJsonData(page, LIFTING)];
                case 21:
                    innerText3 = _a.sent();
                    progbar.update(185);
                    return [2 /*return*/, [innerText, innerText2, innerText3]];
                case 22: return [4 /*yield*/, browser.close()];
                case 23:
                    _a.sent();
                    return [7 /*endfinally*/];
                case 24: return [2 /*return*/];
            }
        });
    });
}
exports.default = downloadData;
//# sourceMappingURL=GarminDownloader.js.map