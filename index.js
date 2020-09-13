const fs = require('fs');
const express = require('express');
const app = express();
const port = 3000;

const axios = require('axios');
const xml2js = require('xml2js');
const parser = new xml2js.Parser({ explicitArray: false });

const createCsvStringifier = require('csv-writer').createObjectCsvStringifier;

const instance = axios.create({
    baseURL: 'https://api.stlouisfed.org/fred/series',
    timeout: 10000,
    headers: { 'X-Custom-Header': 'foobar' }
});

let api1results = [];

const getObservations = (url, key) => {
    return new Promise((resolve, reject) => {
        instance.get(url).then((response) => {
            parser.parseString(response.data, (err, result) => {
                if (err) {
                    console.error(err);
                    reject(error);
                }

                const observations = result['observations']['observation'];
                observations.map(observation => {
                    const obs = api1results[observation['$'].date];
                    if (obs) {
                        api1results[observation['$'].date] = Object.assign({}, obs, { [key]: observation['$'].value })
                    } else {
                        api1results[observation['$'].date] = { [key]: observation['$'].value };
                    }
                })
                resolve();
            })
        });
    })
}

const csvStringifier = createCsvStringifier({
    header: [
        { id: 'date', title: 'Date' },
        { id: 'M1', title: 'M1' },
        { id: 'M2', title: 'M2' },
        { id: 'MZM', title: 'MZM' },
    ]
});

app.get('/', (req, res) => {
    res.send('Hello, API');
});

app.get('/fred', (req, res) => {
    getObservations('/observations?series_id=MZM&api_key=efa2adfbcb1f39c9c62141477736fcae', 'MZM').then(() => {
        getObservations('/observations?series_id=M1&api_key=efa2adfbcb1f39c9c62141477736fcae', 'M1').then(() => {
            getObservations('/observations?series_id=M2&api_key=efa2adfbcb1f39c9c62141477736fcae', 'M2').then(() => {
    
                const keys = Object.keys(api1results);
                const results = [];
                keys.map(key => {
                    const observations = api1results[key];
                    results.push({
                        date: key,
                        M1: observations.M1,
                        M2: observations.M2,
                        MZM: observations.MZM
                    });
                })
    
                res.send(csvStringifier.stringifyRecords(results));
    
            })
        })
    });
})

app.listen(port, () => {
    console.log('API has started.');
})