const request = require("request");
const cheerio = require("cheerio");
const excel = require("exceljs");

const workbook = new excel.Workbook();
workbook.creator = "Nitin Mokashi";
workbook.lastModifiedBy = "Nitin Mokashi";
workbook.created = new Date(2021, 10, 12);
workbook.modified = new Date();
workbook.properties.date1904 = true;

const url = "https://www.espncricinfo.com/";
const series = "series/";
const seriesId = "ipl-2020-21-1210595";
const completeUrl = url + series + seriesId + "/match-results";

const teamShortForms = {
    "Chennai Super Kings": "CSK",
    "Delhi Capitals": "DC",
    "Kolkata Knight Riders": "KKR",
    "Mumbai Indians": "MI",
    "Punjab Kings": "PBKS",
    "Royal Challengers Bangalore": "RCB",
    "Rajasthan Royals": "RR",
    "Sunrisers Hyderabad": "SRH",
};

request(completeUrl, cb);
let isDone = false;
async function cb(err, res, html) {
    if (err) {
        console.log("some err occured in cb", res);
        return;
    }

    const $ = cheerio.load(html);
    const scoreCard = $('[data-hover="Scorecard"]');
    for (let i = 0; i < scoreCard.length; ++i) {
        let matchUrl = url + $(scoreCard[i]).attr("href");
        let arr = matchUrl.split("/");
        arr = arr[arr.length - 2].split("-");
        let id = arr[arr.length - 1];
        if (i == scoreCard.length - 1) {
            isDone = true;
        }
        request(matchUrl, matchCB.bind(this, id));
    }
}

function matchCB(id, err, res, html) {
    if (err) {
        console.log("some err occured in matchCB", res);
        return;
    }
    const $ = cheerio.load(html);
    let teams = $(".name-link .name");
    let team1 = teamShortForms[$(teams[0]).text()];
    let team2 = teamShortForms[$(teams[1]).text()];
    let collapsible = $(".Collapsible");
    for (let table = 0; table < collapsible.length; ++table) {
        let batsManTable = $(collapsible[table])
            .children(".Collapsible__contentOuter")
            .children(".Collapsible__contentInner")
            .children("div")
            .children(".batsman");
        let bowlerTable = $(collapsible[table])
            .children(".Collapsible__contentOuter")
            .children(".Collapsible__contentInner")
            .children("div")
            .children(".bowler");
        let batsMansheet = workbook.addWorksheet(
            `${id}-${team1}vs${team2}-i${table + 1}batting`
        );
        batsMansheet.columns = [
            { header: "Id", key: "id", width: 10 },
            { header: "Name", key: "nam", width: 32 },
            { header: "Runs", key: "r", width: 10, outlineLevel: 1 },
            { header: "For Bolls", key: "b", width: 10, outlineLevel: 1 },
            { header: "Fours", key: "four", width: 10, outlineLevel: 1 },
            { header: "Sixs", key: "six", width: 10, outlineLevel: 1 },
            { header: "Strike Rate", key: "sr", width: 10, outlineLevel: 1 },
        ];
        let batsManTableRows = $(batsManTable).children("tbody").children("tr");
        let rowCounter = 0;
        for (let row = 0; row < batsManTableRows.length - 1; ++row) {
            let columnData = $(batsManTableRows[row]).children("td");
            if ($(columnData).length == 1) continue;
            let data = [rowCounter + 1];
            for (let col = 0; col < columnData.length; ++col) {
                if (col == 1 || col == 4) {
                    continue;
                }
                let val = $(columnData[col]).text();
                val = isNaN(val) ? val : Number(val);
                data.push(val);
            }
            batsMansheet.addRow(data);
            rowCounter++;
        }

        let bowlersSheet = workbook.addWorksheet(
            `${id}-${team1}vs${team2}-i${table + 1}bowlling`
        );
        bowlersSheet.columns = [
            { header: "Id", key: "id", width: 10 },
            { header: "Name", key: "name", width: 32 },
            { header: "overs", key: "o", width: 10, outlineLevel: 1 },
            { header: "Maiden overs", key: "m", width: 15, outlineLevel: 1 },
            { header: "Runs", key: "r", width: 10, outlineLevel: 1 },
            { header: "wicket", key: "w", width: 10, outlineLevel: 1 },
            { header: "economy rate", key: "econ", width: 15, outlineLevel: 1 },
            { header: "0s", key: "zeros", width: 10, outlineLevel: 1 },
            { header: "fours", key: "four", width: 10, outlineLevel: 1 },
            { header: "sixes", key: "six", width: 10, outlineLevel: 1 },
            { header: "WD", key: "wd", width: 10, outlineLevel: 1 },
            { header: "No Boll", key: "nb", width: 10, outlineLevel: 1 },
        ];
        let bowlerTableRows = $(bowlerTable).children("tbody").children("tr");
        rowCounter = 0;
        for (let row = 0; row < bowlerTableRows.length; ++row) {
            let columnData = $(bowlerTableRows[row]).children("td");
            if ($(columnData).length < 2) continue;
            let data = [rowCounter + 1];
            for (let col = 0; col < columnData.length; ++col) {
                let val = $(columnData[col]).text();
                val = isNaN(val) ? val : Number(val);
                data.push(val);
            }
            bowlersSheet.addRow(data);
            rowCounter++;
        }
    }
    if (isDone) {
        workbook.xlsx
            .writeFile("result.xlsx")
            .then(() => {
                console.log("done");
            })
            .catch((err) => {
                console.log("some err occoured", err);
            });
    }
}
