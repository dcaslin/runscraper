"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// import * as moment from "moment";
var moment_1 = __importDefault(require("moment"));
// import { median as ssMedian, min as ssMin, max as ssMax, mean as ssMean, sum as ssSum } from "simple-statistics";
var mathjs_1 = require("mathjs");
function parse(json, json2, json3) {
    return __awaiter(this, void 0, void 0, function () {
        var data, weights, lifting, weeks, weightWeeks, liftingWeeks, _i, lifting_1, l, m, key, _a, weights_1, w, m, key, _b, data_1, run, m, key, summaries, key, entries, weightWeek, liftingWeek, week, sCsv;
        return __generator(this, function (_c) {
            data = JSON.parse(json);
            weights = JSON.parse(json2);
            lifting = JSON.parse(json3);
            data.reverse();
            weights.reverse();
            weeks = {};
            weightWeeks = {};
            liftingWeeks = {};
            for (_i = 0, lifting_1 = lifting; _i < lifting_1.length; _i++) {
                l = lifting_1[_i];
                m = moment_1.default(l.startTimeLocal);
                key = m.year() + "-" + m.isoWeek();
                if (liftingWeeks[key] === undefined) {
                    liftingWeeks[key] = [];
                }
                liftingWeeks[key].push(l);
            }
            for (_a = 0, weights_1 = weights; _a < weights_1.length; _a++) {
                w = weights_1[_a];
                m = moment_1.default(w.date);
                key = m.year() + "-" + m.isoWeek();
                if (weightWeeks[key] === undefined) {
                    weightWeeks[key] = [];
                }
                weightWeeks[key].push(w);
            }
            for (_b = 0, data_1 = data; _b < data_1.length; _b++) {
                run = data_1[_b];
                m = moment_1.default(run.startTimeLocal);
                key = m.year() + "-" + m.isoWeek();
                if (weeks[key] === undefined) {
                    weeks[key] = [];
                }
                weeks[key].push(run);
            }
            summaries = [];
            for (key in weeks) {
                entries = weeks[key];
                weightWeek = weightWeeks[key];
                liftingWeek = liftingWeeks[key];
                week = handleWeek(entries, weightWeek, liftingWeek);
                summaries.push(week);
                // console.dir(week);
            }
            summaries.reverse();
            sCsv = printCsv(summaries);
            return [2 /*return*/, sCsv];
        });
    });
}
exports.default = parse;
function printCsv(list) {
    var sCsv = "Date, Count, Lifting, Distance, Mins, Cals, Elev Gain, Mean Avg Pace, Max Avg Page, Mean Avg HR, Max MAX HR, Mean Stride, Mean Cadence, Min Weight, Max Weight, Median Weight, Mean Weight,Run Days, Lift Days, Min An, Max An, Median An, Min Aer, Max Aer, Median Aer, Min Vo2, Max Vo2, Median Vo2, Min Temp, Max Temp, Median Temp \r\n";
    for (var _i = 0, list_1 = list; _i < list_1.length; _i++) {
        var s = list_1[_i];
        // skip weeks with no running data
        if (s.count === 0)
            continue;
        sCsv += s.startDate + ", ";
        sCsv += s.count.toFixed(0) + ", ";
        sCsv += s.liftingCount.toFixed(0) + ", ";
        sCsv += s.totalDist.toFixed(1) + ", ";
        sCsv += formatMins(s.totalMinutes) + ", ";
        sCsv += s.totalCalories.toFixed(0) + ", ";
        sCsv += s.totalElevGain.toFixed(0) + ", ";
        sCsv += formatMins(s.meanAvgPace) + ", ";
        sCsv += formatMins(s.maxAvgPace) + ", ";
        sCsv += s.meanAvgHR.toFixed(0) + ", ";
        sCsv += s.maxMaxHR.toFixed(0) + ", ";
        sCsv += s.meanStrideLength.toFixed(0) + ", ";
        sCsv += s.meanAvgCadence.toFixed(0) + ", ";
        sCsv += s.minWeight.toFixed(2) + ", ";
        sCsv += s.maxWeight.toFixed(2) + ", ";
        sCsv += s.medianWeight.toFixed(1) + ", ";
        sCsv += s.meanWeight.toFixed(1) + ", ";
        sCsv += s.days + ", ";
        sCsv += s.liftingDays + ", ";
        sCsv += s.minAnaerobic.toFixed(1) + ", ";
        sCsv += s.maxAnaerobic.toFixed(1) + ", ";
        sCsv += s.medianAnaerobic.toFixed(1) + ", ";
        sCsv += s.minAerobic.toFixed(1) + ", ";
        sCsv += s.maxAerobic.toFixed(1) + ", ";
        sCsv += s.medianAerobic.toFixed(1) + ", ";
        sCsv += s.minVo2.toFixed(1) + ", ";
        sCsv += s.maxVo2.toFixed(1) + ", ";
        sCsv += s.medianVo2.toFixed(1) + ", ";
        sCsv += s.minTemp.toFixed(1) + ", ";
        sCsv += s.maxTemp.toFixed(1) + ", ";
        sCsv += s.medianTemp.toFixed(1);
        sCsv += "\r\n";
    }
    return sCsv;
}
function formatHours(mins) {
    var dur = moment_1.default.duration(mins, "minutes");
    return Math.floor(dur.asHours()) + moment_1.default.utc(dur.asMilliseconds()).format(":mm:ss");
}
function formatMins(i) {
    var dur = moment_1.default.duration(i, "minutes");
    return Math.floor(dur.asMinutes()) + moment_1.default.utc(dur.asMilliseconds()).format(":ss");
}
function handleWeek(runs, weights, lifting) {
    if (lifting === undefined) {
        lifting = [];
    }
    var start = moment_1.default(runs[runs.length - 1].startTimeLocal);
    var aDist = column(runs, "distance", function (input) { return input / 1609.34; });
    var aDur = column(runs, "duration", function (input) { return input / 60; });
    var aElevGain = column(runs, "elevationGain", function (i) { return i * 3.28084; });
    var aCals = column(runs, "calories");
    var aAvgHR = column(runs, "averageHR");
    var aMaxHR = column(runs, "maxHR");
    var aAvgStrideLength = column(runs, "avgStrideLength"); // units? 112
    var aAerobicEffect = column(runs, "aerobicTrainingEffect");
    var aAnaerobicEffect = column(runs, "anaerobicTrainingEffect");
    var aVO2MaxValue = column(runs, "vO2MaxValue");
    var aMinTemp = column(runs, "minTemperature", function (i) { return (i * (9 / 5)) + 32; });
    // const aSteps = column(runs, "steps");
    var aAvgCadence = column(runs, "averageRunningCadenceInStepsPerMinute");
    var aMaxCadence = column(runs, "maxRunningCadenceInStepsPerMinute");
    var aMaxPace = column(runs, "maxSpeed", function (i) { if (i === 0)
        return undefined;
    else
        return (1 / i) * 26.822; });
    var aAvgPace = column(runs, "averageSpeed", function (i) { if (i === 0)
        return undefined; return (1 / i) * 26.822; });
    var aWeights = column(weights, "weight", function (i) { return i / 453.592; });
    var s = "";
    for (var _i = 0, runs_1 = runs; _i < runs_1.length; _i++) {
        var run = runs_1[_i];
        s += moment_1.default(run.startTimeLocal).format("ddd") + " ";
    }
    if (runs.length === 0) {
        s = "N/A";
    }
    var ls = "";
    for (var _a = 0, lifting_2 = lifting; _a < lifting_2.length; _a++) {
        var l = lifting_2[_a];
        ls += moment_1.default(l.startTimeLocal).format("ddd") + " ";
    }
    if (lifting.length === 0) {
        ls = "N/A";
    }
    start.startOf("isoWeek");
    var summary = {
        startDate: start.format("YYYY-MM-DD"),
        count: runs.length,
        days: s,
        liftingCount: lifting.length,
        liftingDays: ls,
        totalDist: mathjs_1.sum(aDist),
        minDist: mathjs_1.min(aDist),
        maxDist: mathjs_1.max(aDist),
        meanDist: mathjs_1.mean(aDist),
        totalElevGain: mathjs_1.sum(aElevGain),
        totalCalories: mathjs_1.sum(aCals),
        totalMinutes: mathjs_1.sum(aDur),
        minAvgPace: mathjs_1.min(aAvgPace),
        maxAvgPace: mathjs_1.max(aAvgPace),
        meanAvgPace: mean(aAvgPace),
        minStrideLength: min(aAvgStrideLength),
        maxStrideLength: max(aAvgStrideLength),
        meanStrideLength: mean(aAvgStrideLength),
        minAvgHR: min(aAvgHR),
        maxAvgHR: max(aAvgHR),
        meanAvgHR: mean(aAvgHR),
        minMaxHR: min(aMaxHR),
        maxMaxHR: max(aMaxHR),
        minAvgCadence: min(aAvgCadence),
        maxAvgCadence: max(aAvgCadence),
        meanAvgCadence: mean(aAvgCadence),
        minMaxCadence: min(aMaxCadence),
        maxMaxCadence: max(aMaxCadence),
        meanMaxCadence: mean(aMaxCadence),
        maxMaxPace: max(aMaxPace),
        minWeight: min(aWeights),
        maxWeight: max(aWeights),
        meanWeight: mean(aWeights),
        medianWeight: median(aWeights),
        minAnaerobic: min(aAnaerobicEffect),
        maxAnaerobic: max(aAnaerobicEffect),
        medianAnaerobic: median(aAnaerobicEffect),
        minAerobic: min(aAerobicEffect),
        maxAerobic: max(aAerobicEffect),
        medianAerobic: median(aAerobicEffect),
        minVo2: min(aVO2MaxValue),
        maxVo2: max(aVO2MaxValue),
        medianVo2: median(aVO2MaxValue),
        minTemp: min(aMinTemp),
        maxTemp: max(aMinTemp),
        medianTemp: median(aMinTemp)
    };
    return summary;
}
function min(list) {
    if (list.length === 0) {
        return 0;
    }
    return mathjs_1.min(list);
}
function max(list) {
    if (list.length === 0) {
        return 0;
    }
    return mathjs_1.max(list);
}
function mean(list) {
    if (list.length === 0) {
        return 0;
    }
    return mathjs_1.mean(list);
}
function median(list) {
    if (list.length === 0) {
        return 0;
    }
    return mathjs_1.median(list);
}
function column(list, field, mutator) {
    var returnMe = [];
    if (list !== undefined) {
        for (var _i = 0, list_2 = list; _i < list_2.length; _i++) {
            var i = list_2[_i];
            var val = i[field];
            if (val === null) {
                continue;
            }
            if (mutator === undefined) {
                returnMe.push(val);
            }
            else {
                var mut = mutator(val);
                if (mut !== undefined) {
                    returnMe.push(mut);
                }
            }
        }
    }
    return returnMe;
}
//# sourceMappingURL=RunParser.js.map