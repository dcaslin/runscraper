import * as fs from "fs-extra";
import downloadData from "./GarminDownloader";
import * as program from "commander";
import * as cliProgress from "cli-progress";
import parse from "./RunParser";

let pw: string;
let uid: string;
program
    .version("0.1.0")
    .arguments("<uid> <pw>")
    .option("-d, --debug", "Debug mode")
    .action((uidA, pwA, debugA) => {
        uid = uidA;
        pw = pwA;
    });

program.parse(process.argv);

if (!program.args.length || uid === undefined || pw === undefined) {
    program.help();
    process.exit(0);
}
const debug = program.debug;

const progbar = new cliProgress.Bar({ clearOnComplete: true }, cliProgress.Presets.shades_classic);
progbar.start(200, 0);
progbar.update(100);
(async () => {
    try {
        const aJson = await downloadData(uid, pw, debug, progbar);
        fs.writeFile("./data/running.json", aJson[0]);
        fs.writeFile("./data/weight.json", aJson[1]);
        fs.writeFile("./data/lifting.json", aJson[2]);
        progbar.update(200);
        progbar.stop();
        const buffer = await fs.readFile("./data/running.json");
        const json = buffer.toString("utf8");
        const buffer2 = await fs.readFile("./data/weight.json");
        const json2 = buffer2.toString("utf8");
        const buffer3 = await fs.readFile("./data/lifting.json");
        const json3 = buffer3.toString("utf8");
        const sCsv = await parse(json, json2, json3);
        fs.writeFile("./data/data.csv", sCsv);
        console.log("Success!");
    }
    catch (e) {
        console.log("Error: " + e);
    }
    console.log("Done");
})();

// TODO
// "aerobicTrainingEffect": 3,
// "anaerobicTrainingEffect": 0,
// "vO2MaxValue": 51,
// "minTemperature": 30,