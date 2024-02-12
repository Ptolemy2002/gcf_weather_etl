const {Storage} = require("@google-cloud/storage");
const csv = require("csv-parser");
const {BigQuery} = require("@google-cloud/bigquery");

const bq = new BigQuery();
const datasetId = "weather_etl";
const tableId = "observations";

function printDict(row) {
    Object.keys(row).forEach((key) => {
        console.log(`${key}: ${row[key]}`)
    })
}

function transformData(data, intKeys=[]) {
    const result = {};

    Object.keys(data).forEach((key) => {
        const value = data[key];
        if (!isNaN(value)) {
            if (value.includes("-9999")) {
                result[key] = null;
            } else if (intKeys.includes(key)) {
                result[key] = parseInt(value);
            } else {
                result[key] = parseFloat(value) / 10
            }
        } else {
            result[key] = value;
        }
    });

    return result
}

async function writeToBQ(obj) {
    await bq.dataset(datasetId)
        .table(tableId)
        .insert([obj])
        .then(() => {
            console.log(`Inserted ${obj}`)
        })
        .catch(console.error)
    ;
}

exports.readObservation = (file, context) => {
    console.log(`  Event: ${context.eventId}`);
    console.log(`  Event Type: ${context.eventType}`);
    console.log(`  Bucket: ${file.bucket}`);
    console.log(`  File: ${file.name}`);

    const gcs = new Storage();
    const dataFile = gcs.bucket(file.bucket).file(file.name);

    dataFile.createReadStream()
        .on("error", (e) => {
            console.error(e);
        })
        .pipe(csv())
            .on("data", async (row) => {
                printDict(row);
                await writeToBQ({
                    ...transformData(row, ["year", "month", "day", "hour", "winddirection", "sky"]),
                    station: file.name.split(".")[0]
                });
            })
            .on("end", () => {
                console.log("End!");
            });
}