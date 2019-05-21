'use strict';
const { dialogflow } = require('actions-on-google');
const functions = require('firebase-functions');
const http = require('http');
const parseString = require('xml2js').parseString;
const striptags = require('striptags');

const app = dialogflow();

app.intent('Default Welcome Intent', conv => {
    conv.ask("Hi, here's your Daily Prayer");

    return new Promise((resolve, reject) => {
        var url = "http://www.plough.com/en/daily-prayer-rss-feed";
        xmlToJson(url, function (err, data) {
            var prayer = "";
            if (err) {
                prayer = "I'm sorry, Daily Prayer is not available at this moment."
            } else {
                prayer = data.rss.channel[0].item[0].description[0];
                prayer = striptags(prayer);
            }

            resolve(conv.ask(prayer));
        });
    });
});

function xmlToJson(url, callback) {
    var req = http.get(url, function (res) {
        var xml = '';

        res.on('data', function (chunk) {
            xml += chunk;
        });

        res.on('error', function (e) {
            callback(e, null);
        });

        res.on('timeout', function (e) {
            callback(e, null);
        });

        res.on('end', function () {
            parseString(xml, function (err, result) {
                callback(null, result);
            });
        });
    });
}

exports.dialogflowFirebaseFulfillment = functions.https.onRequest(app);