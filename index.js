const {Storage} = require("@google-cloud/storage");
const csv = require("csv-parser");

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
                console.log(row);
            })
            .on("end", () => {
                console.log("End!")
            });
}