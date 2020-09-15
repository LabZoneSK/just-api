// fed.service.js
const fedObservations = require('../fed/observations.js');

module.exports = {
    name: "fed",
    actions: {
        async observations(ctx) {
            const now = new Date();
            ctx.meta.$responseType = "text/csv";
            ctx.meta.$responseHeaders = {
                "Content-Disposition": `attachment; filename="observations-${now.toDateString()}.csv"`
            };
            return await fedObservations.getObservationsCSV();
        }
    }
}