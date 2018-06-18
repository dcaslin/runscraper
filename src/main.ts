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

const progbar = new cliProgress.Bar({clearOnComplete: true}, cliProgress.Presets.shades_classic);
progbar.start(200, 0);
progbar.update(100);
(async () => {
    const aJson = await downloadData(uid, pw, debug, progbar);
    fs.writeFile("./data/running.json", aJson[0]);
    fs.writeFile("./data/weight.json", aJson[1]);
    progbar.update(200);
    progbar.stop();
    const buffer = await fs.readFile("./data/running.json");
    const json = buffer.toString("utf8");
    const buffer2 = await fs.readFile("./data/weight.json");
    const json2 = buffer2.toString("utf8");
    const sCsv = await parse(json, json2);
    fs.writeFile("./data/data.csv", sCsv);
    console.log("Done");
})();