const request = require('request');
const cheerio = require('cheerio');

const url = 'https://www.espncricinfo.com/series/';
const seriesId = 'ipl-2020-21-1210595';
const completeUrl = url + seriesId + '/match-results';
request(completeUrl, cb);

function cb(err, res, html) {
    if(err) {
        console.log('some err occured in cb', res);
        return;
    }

    const $ = cheerio.load(html);
    const scoreCard = $('[data-hover="Scorecard"]');
    for(let index = 0; index < scoreCard.length; ++index) {
        console.log($(scoreCard[index]).attr('href'));
    }
}