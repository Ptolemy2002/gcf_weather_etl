const {Storage} = require("@google-cloud/storage");
const csv = require("csv-parser");

function printDict(row) {
    Object.keys(row).forEach((key) => {
        console.log(`${key}: ${row[key]}`)
    })
}

exports.readObservation = (file, context) => {
    // console.log(`  Event: ${context.eventId}`);
    // console.log(`  Event Type: ${context.eventType}`);
    // console.log(`  Bucket: ${file.bucket}`);
    // console.log(`  File: ${file.name}`);

    const gcs = new Storage();
    const dataFile = gcs.bucket(file.bucket).file(file.name);

    dataFile.createReadStream()
        .on("error", (e) => {
            console.error(e);
        })
        .pipe(csv())
            .on("data", (row) => {
                printDict(row);
            })
            .on("end", () => {
                console.log("End!");
            });
}