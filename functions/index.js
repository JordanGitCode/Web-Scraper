/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

const cors = require('cheerio')
const getUrls = require('get-urls')
const fetch = require('node-fetch')

const scrapeMetatags = ( text ) => {

    const urls = Array.from( getUrls(text) )

    const requests = urls.map(async url => {

        const res = await fetch(url)

        const html = await res.text();

        const $ = cheerio.load(html)

        const getMatatag = (name) => 
            $(`meta[name=${name}]`).attr('content') ||
            $(`meta[property="og:${name}"]`).attr('content') ||
            $(`meta[property="twitter:${name}"]`).attr('content')
        

        return {
            url,
            title: $('title').text(),
            favicon: $('link[rel="shortcut icon"]').attr('href'),
            description: getMatatag('description'),
            image: getMatatag('image'),
            author: getMatatag('author')
        }

    })

    return Promise.all(requests)

}


exports.scraper = functions.https.onRequest((request, response) => {

    cors(request, response, async() => {

        const body = JSON.parse(request.body)
        const data = await scrapeMetatags(body.text)
        
        response.send(data)
    })

})