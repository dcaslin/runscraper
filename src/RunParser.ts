import * as moment from "moment";
import * as ss from "simple-statistics";

export default async function parse(json: string, json2: string, json3: string): Promise<string> {
    const data: Activity[] = JSON.parse(json);
    const weights: Weight[] = JSON.parse(json2);
    const lifting: Activity[] = JSON.parse(json3);
    data.reverse();
    weights.reverse();
    const weeks: {[index: string]: Activity[] } = {};
    const weightWeeks: {[index: string]: Weight[] } = {};
    const liftingWeeks: {[index: string]: Activity[] } = {};

    for (const l of lifting) {

        const m = moment(l.startTimeLocal);
        const key = m.year() + "-" + m.isoWeek();
        if (liftingWeeks[key] === undefined) {
            liftingWeeks[key] = [];
        }
        liftingWeeks[key].push(l);
    }

    for (const w of weights) {
        const m = moment(w.date);
        const key = m.year() + "-" + m.isoWeek();
        if (weightWeeks[key] === undefined) {
            weightWeeks[key] = [];
        }
        weightWeeks[key].push(w);
    }

    for (const run of data) {
        const m = moment(run.startTimeLocal);
        const key = m.year() + "-" + m.isoWeek();
        if (weeks[key] === undefined) {
            weeks[key] = [];
        }
        weeks[key].push(run);
    }
    const summaries = [];
    for (const key in weeks) {
        const entries = weeks[key];
        const weightWeek = weightWeeks[key];
        const liftingWeek = liftingWeeks[key];
        const week = handleWeek(entries, weightWeek, liftingWeek);
        summaries.push(week);
        // console.dir(week);
    }
    summaries.reverse();
    const sCsv = printCsv(summaries);
    return sCsv;
}

function printCsv(list: Summary[]): string {
    let sCsv = "Date, Count, Lifting, Distance, Mins, Cals, Elev Gain, Mean Avg Pace, Max Avg Page, Mean Avg HR, Mean Stride, Mean Cadence, Min Weight, Max Weight, Median Weight, Mean Weight,Run Days, Lift Days, Min An, Max An, Median An, Min Aer, Max Aer, Median Aer, Min Vo2, Max Vo2, Median Vo2, Min Temp, Max Temp, Median Temp \r\n";
    for (const s of list) {
        // skip weeks with no running data
        if (s.count === 0) continue;
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

function formatHours(mins: number): string {
    const dur = moment.duration(mins, "minutes");
    return Math.floor(dur.asHours()) + moment.utc(dur.asMilliseconds()).format(":mm:ss");
}


function formatMins(i: number): string {
    const dur = moment.duration(i, "minutes");
    return Math.floor(dur.asMinutes()) + moment.utc(dur.asMilliseconds()).format(":ss");
}

function handleWeek(runs: Activity[], weights: Weight[], lifting: Activity[]): Summary {
    if (lifting === undefined) {
        lifting = [];
    }
    const start = moment(runs[runs.length - 1].startTimeLocal);

    const aDist = column(runs, "distance", (input: number) => {return input / 1609.34; });
    const aDur = column(runs, "duration", (input: number) => {return input / 60; });
    const aElevGain = column(runs, "elevationGain", (i: number) => {return i * 3.28084; });
    const aCals = column(runs, "calories");
    const aAvgHR = column(runs, "averageHR");
    const aMaxHR = column(runs, "maxHR");
    const aAvgStrideLength = column(runs, "avgStrideLength"); // units? 112

    const aAerobicEffect = column(runs, "aerobicTrainingEffect");
    const aAnaerobicEffect = column(runs, "anaerobicTrainingEffect");
    const aVO2MaxValue = column(runs, "vO2MaxValue");
    const aMinTemp = column(runs, "minTemperature", (i: number) => {return  (i * (9 / 5)) + 32; });

    // const aSteps = column(runs, "steps");
    const aAvgCadence = column(runs, "averageRunningCadenceInStepsPerMinute");
    const aMaxCadence = column(runs, "maxRunningCadenceInStepsPerMinute");
    const aMaxPace = column(runs, "maxSpeed", (i: number) => {if (i === 0) return undefined; else return (1 / i) * 26.822; });
    const aAvgPace = column(runs, "averageSpeed", (i: number) => {if (i === 0) return undefined; return (1 / i) * 26.822; });
    const aWeights = column(weights, "weight", (i: number) => {return i / 453.592; });
    let s = "";
    for (const run of runs) {
        s += moment(run.startTimeLocal).format("ddd") + " ";
    }
    if (runs.length === 0) {
        s = "N/A";
    }
    let ls = "";
    console.log(lifting.length);
    for (const l of lifting) {
        ls += moment(l.startTimeLocal).format("ddd") + " ";
        console.log(l.startTimeLocal);
    }
    if (lifting.length === 0) {
        ls = "N/A";
    }
    start.startOf("isoWeek");

    const summary = {
        startDate: start.format("YYYY-MM-DD"),
        count: runs.length,
        days: s,
        liftingCount: lifting.length,
        liftingDays: ls,
        totalDist: ss.sum(aDist),
        minDist: ss.min(aDist),
        maxDist: ss.max(aDist),
        meanDist: ss.mean(aDist),
        totalElevGain: ss.sum(aElevGain),
        totalCalories: ss.sum(aCals),
        totalMinutes: ss.sum(aDur),
        minAvgPace: ss.min(aAvgPace),
        maxAvgPace: ss.max(aAvgPace),
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


function min(list: number[]): number {
    if (list.length === 0) {
        return 0;
    }
    return ss.min(list);
}


function max(list: number[]): number {
    if (list.length === 0) {
        return 0;
    }
    return ss.max(list);
}

function mean(list: number[]): number {
    if (list.length === 0) {
        return 0;
    }
    return ss.mean(list);
}

function median(list: number[]): number {
    if (list.length === 0) {
        return 0;
    }
    return ss.median(list);
}

interface Summary {
    startDate: string;
    count: number;
    days: string;
    liftingCount: number;
    liftingDays: string;
    totalDist: number;
    minDist: number;
    maxDist: number;
    meanDist: number;
    totalElevGain: number;
    totalCalories: number;
    totalMinutes: number;
    minAvgPace: number;
    maxAvgPace: number;
    meanAvgPace: number;
    minStrideLength: number;
    maxStrideLength: number;
    meanStrideLength: number;
    minAvgHR: number;
    maxAvgHR: number;
    meanAvgHR: number;
    minMaxHR: number;
    maxMaxHR: number;
    minAvgCadence: number;
    maxAvgCadence: number;
    meanAvgCadence: number;
    minMaxCadence: number;
    maxMaxCadence: number;
    meanMaxCadence: number;
    maxMaxPace: number;
    minWeight: number;
    maxWeight: number;
    meanWeight: number;
    medianWeight: number;
    minAnaerobic: number;
    maxAnaerobic: number;
    medianAnaerobic: number;
    minAerobic: number;
    maxAerobic: number;
    medianAerobic: number;
    minVo2: number;
    maxVo2: number;
    medianVo2: number;
    minTemp: number;
    maxTemp: number;
    medianTemp: number;
}

function column(list: any[], field: string, mutator?: ColumnMutator): number[] {
    const returnMe = [];
    if (list !== undefined) {
        for (const i of list) {
            const val = i[field];
            if (val === null) {
                continue;
            }
            if (mutator === undefined) {
                returnMe.push(val);
            }
            else {
                const mut = mutator(val);
                if (mut !== undefined) {
                    returnMe.push(mut);
                }
            }
        }
    }
    return returnMe;
}

type ColumnMutator = (input: number) => number;

interface Weight {
    samplePk: number;
    date: number;
    weight: number;
    bmi: number;
    bodyFat: number;
    bodyWater: number;
    boneMass: number;
    muscleMass: number;
    physiqueRating?: any;
    visceralFat?: any;
    metabolicAge?: any;
    caloricIntake?: any;
    sourceType?: any;
  }

interface Activity {
    activityId: number;
    activityName: string;
    description?: any;
    startTimeLocal: string;
    startTimeGMT: string;
    activityType: ActivityType;
    eventType: EventType;
    comments?: any;
    parentId?: any;
    distance: number;
    duration: number;
    elapsedDuration: number;
    movingDuration: number;
    elevationGain: number;
    elevationLoss: number;
    averageSpeed: number;
    maxSpeed: number;
    startLatitude: number;
    startLongitude: number;
    hasPolyline: boolean;
    ownerId: number;
    ownerDisplayName: string;
    ownerFullName: string;
    ownerProfileImageUrlSmall: string;
    ownerProfileImageUrlMedium: string;
    ownerProfileImageUrlLarge: string;
    ownerProfilePk?: any;
    calories: number;
    averageHR: number;
    maxHR: number;
    averageRunningCadenceInStepsPerMinute: number;
    maxRunningCadenceInStepsPerMinute: number;
    averageBikingCadenceInRevPerMinute?: any;
    maxBikingCadenceInRevPerMinute?: any;
    averageSwimCadenceInStrokesPerMinute?: any;
    maxSwimCadenceInStrokesPerMinute?: any;
    averageSwolf?: any;
    activeLengths?: any;
    steps: number;
    conversationUuid?: any;
    conversationPk?: any;
    numberOfActivityLikes?: any;
    numberOfActivityComments?: any;
    likedByUser?: any;
    commentedByUser?: any;
    activityLikeDisplayNames?: any;
    activityLikeFullNames?: any;
    requestorRelationship?: any;
    userRoles: string[];
    privacy: Privacy;
    userPro: boolean;
    courseId?: any;
    poolLength?: any;
    unitOfPoolLength?: any;
    hasVideo: boolean;
    videoUrl?: any;
    timeZoneId: number;
    beginTimestamp: number;
    sportTypeId: number;
    avgPower?: any;
    maxPower?: any;
    aerobicTrainingEffect?: any;
    anaerobicTrainingEffect?: any;
    strokes?: any;
    normPower?: any;
    leftBalance?: any;
    rightBalance?: any;
    avgLeftBalance?: any;
    max20MinPower?: any;
    avgVerticalOscillation?: any;
    avgGroundContactTime?: any;
    avgStrideLength: number;
    avgFractionalCadence?: any;
    maxFractionalCadence?: any;
    trainingStressScore?: any;
    intensityFactor?: any;
    vO2MaxValue?: any;
    avgVerticalRatio?: any;
    avgGroundContactBalance?: any;
    lactateThresholdBpm?: any;
    lactateThresholdSpeed?: any;
    maxFtp?: any;
    avgStrokeDistance?: any;
    avgStrokeCadence?: any;
    maxStrokeCadence?: any;
    workoutId?: any;
    avgStrokes?: any;
    minStrokes?: any;
    deviceId: number;
    minTemperature?: any;
    maxTemperature?: any;
    minElevation: number;
    maxElevation: number;
    avgDoubleCadence?: any;
    maxDoubleCadence: number;
    summarizedExerciseSets: any[];
    maxDepth?: any;
    avgDepth?: any;
    surfaceInterval?: any;
    startN2?: any;
    endN2?: any;
    startCns?: any;
    endCns?: any;
    summarizedDiveInfo: SummarizedDiveInfo;
    activityLikeAuthors?: any;
    avgVerticalSpeed?: any;
    maxVerticalSpeed: number;
    floorsClimbed?: any;
    floorsDescended?: any;
    manufacturer?: any;
    diveNumber?: any;
    locationName: string;
    bottomTime?: any;
    lapCount: number;
    endLatitude?: any;
    endLongitude?: any;
    minAirSpeed?: any;
    maxAirSpeed?: any;
    avgAirSpeed?: any;
    avgWindYawAngle?: any;
    minCda?: any;
    maxCda?: any;
    avgCda?: any;
    avgWattsPerCda?: any;
    flow?: any;
    grit?: any;
    jumpCount?: any;
    caloriesEstimated?: any;
    caloriesConsumed?: any;
    waterEstimated?: any;
    waterConsumed?: any;
    favorite: boolean;
    pr: boolean;
    autoCalcCalories: boolean;
    parent: boolean;
    atpActivity: boolean;
    elevationCorrected: boolean;
    purposeful: boolean;
    decoDive?: any;
  }

  interface SummarizedDiveInfo {
    weight?: any;
    weightUnit?: any;
    visibility?: any;
    visibilityUnit?: any;
    surfaceCondition?: any;
    current?: any;
    waterType?: any;
    waterDensity?: any;
    summarizedDiveGases: any[];
    totalSurfaceTime: number;
  }

  interface Privacy {
    typeId: number;
    typeKey: string;
  }

  interface EventType {
    typeId: number;
    typeKey: string;
    sortOrder: number;
  }

  interface ActivityType {
    typeId: number;
    typeKey: string;
    parentTypeId: number;
    sortOrder: number;
  }