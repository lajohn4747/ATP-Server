const { response } = require('express');
const { name_mapping } = require('./name_mapping');
const { default: axios, all } = require('axios');
const moment = require('moment');
const { createObjectCsvWriter } = require('csv-writer');
const fs = require('fs');
const path = require('path');


var token_url = 'https://api.roller.app/token'
var revenue_url = 'https://api.roller.app/reporting/revenue-entries'


async function getAuthToken(location) {
    // Please fill in for client ID and secret
    const client = name_mapping[location]

    const body = {
        client_id: client[0],
        client_secret: client[1]
    };

    let response = await fetch(token_url, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
            'Content-Type': 'application/json'
        }
    });

    let jsonObj = await response.json();

    if (jsonObj.access_token === undefined) {
        throw new Error(`No access defined!`);
    }

    let headers = { Authorization: `Bearer ${jsonObj.access_token}` }
    return headers;
}

function iterateDates(startDate, endDate) {
    const format = 'YYYY-MM-DD';
    const dates = [];
    let currentDate = moment(startDate, format);

    while (currentDate <= moment(endDate, format)) {
        dates.push(currentDate.format(format));
        currentDate = currentDate.clone().add(1, 'days');
    }

    // Add one more date as we want to be inclusive
    dates.push(currentDate.format(format));
    currentDate = currentDate.clone().add(1, 'days');

    return dates;
}

async function createCSV(res, startDate, endDate) {
    if (!startDate || !endDate) {
        console.log('No start date or end date');
        res.json({ message: 'Bad dates', startDate, endDate });
        return;
    }
    const dates = iterateDates(startDate, endDate);

    let allData = []

    for (let location in name_mapping) {
        console.log(`Processing data for: ${location}`)

        const data = {
            location: location,
            fundsReceived: 0.0,
            taxOnFundsReceived: 0.0,
            voucherFundsReceived: 0.0,
            discount: 0.0,
            feeRevenue: 0.0,
            deferredRevenue: 0.0,
            deferredRevenueGiftCards: 0.0,
            deferredRevenueOther: 0.0,
            accountsReceivable: 0.0,
            netRevenue: 0.0,
            taxPayable: 0.0,
            recognisedDiscount: 0.0,
            deferredRevenueOther: 0.0,
        };

        let headers;
        try {
            headers = await getAuthToken(data.location);
            if (headers.Authorization.contain) {
                console.log(`Authorization Code not retrieved for ${location}. Skipping`);
                continue;
            }
        } catch (error) {
            console.log(`Error getting authorization for ${location}. Skipping`);
            continue;
        }

        for (let i = 0; i < dates.length; i++) {
            if (i >= dates.length - 1) {
                continue;
            }
            console.log(`Handling: ${dates[i]}`)
            let totalPages = 1
            let currentPage = 1
            while (currentPage <= totalPages) {
                let params = { 'startDate': dates[i], 'endDate': dates[i + 1], 'pageNumber': currentPage.toString() };

                let response;
                try {
                    response = await axios.get(revenue_url, {
                        headers: headers,
                        params: params
                    })
                } catch (error) {
                    console.log('JOHN Error');
                    console.log(error);

                }

                const json_data = response.data
                const items = json_data['items']
                currentPage += 1
                totalPages = parseInt(json_data['totalPages'])
                for (const i in items) {
                    data.fundsReceived += parseFloat(items[i].fundsReceived);
                    data.taxOnFundsReceived += parseFloat(items[i].taxOnFundsReceived);
                    data.voucherFundsReceived += parseFloat(items[i].voucherFundsReceived);
                    data.discount += parseFloat(items[i].discount);
                    data.feeRevenue += parseFloat(items[i].feeRevenue);
                    data.deferredRevenue += parseFloat(items[i].deferredRevenue);
                    data.deferredRevenueGiftCards += parseFloat(items[i].deferredRevenueGiftCards);
                    data.accountsReceivable += parseFloat(items[i].accountsReceivable);
                    data.netRevenue += parseFloat(items[i].netRevenue);
                    data.taxPayable += parseFloat(items[i].taxPayable);
                    data.recognisedDiscount += parseFloat(items[i].recognisedDiscount);
                    data.deferredRevenueOther += parseFloat(items[i].deferredRevenueOther);
                }
            }
        }

        allData.push(data)
    }

    // Create a CSV writer
    const csvWriter = createObjectCsvWriter({
        path: `${startDate}-${endDate}.csv`,
        header: getColumnFields().map(header => ({ id: header, title: header }))
    });

    await csvWriter.writeRecords(allData);
    console.log("Complete");
    global.creatingCSV = true;
}

async function sendFile(res, fileName) {
    // Check if the file exists
    fs.access(fileName, fs.constants.F_OK, (err) => {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('File not found');
            return;
        }

        // Read the file and send it in the response
        const fileStream = fs.createReadStream(fileName);
        res.setHeader('Content-disposition', `attachment; filename=${fileName}`);
        res.setHeader('Content-type', 'application/octet-stream');

        fileStream.pipe(res);

        // After sending the file, delete it
        fileStream.on('end', () => {
            const filePath = path.join(__dirname, fileName);
            fs.unlink(filePath, (err) => {
                if (err) {
                    console.error('Error deleting file:', err);
                } else {
                    console.log('File deleted successfully');
                }
            });
        });
    });
}

// Define getColumnFields function here
function getColumnFields() {
    return [
        'location',
        'fundsReceived',
        'taxOnFundsReceived',
        'voucherFundsReceived',
        'discount',
        'feeRevenue',
        'deferredRevenue',
        'deferredRevenueGiftCards',
        'deferredRevenueOther',
        'accountsReceivable',
        'netRevenue',
        'taxPayable',
        'recognisedDiscount',
        'deferredRevenueOther'
    ];
}


module.exports = { createCSV, sendFile }