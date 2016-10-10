const express = require('express');
const fs = require('fs');
const request = require('request');
const cheerio = require('cheerio');
const app = express();

const FETCH_URL = 'https://www.edmontonrealestate.pro/idx/search.html?quick_search=true&search_universal=downtown&idx=ereb&minimum_price=200000&maximum_price=350000&search_reduced=&minimum_year=&maximum_year=&minimum_bedrooms_above_grade=2&maximum_bedrooms_above_grade=&minimum_bedrooms=&maximum_bedrooms=&minimum_full_bathrooms=&maximum_full_bathrooms=&minimum_half_bathrooms=&maximum_half_bathrooms=&minimum_sqft=&maximum_sqft=&minimum_acres=&maximum_acres=&minimum_stories=&maximum_stories=';


function buildAddressLinkMappings(addresses, links) {
  const mappings = [];
  if (addresses.length === links.length) {
    for (let i = 0; i < addresses.length; i ++) {
      const addr = addresses[0].children[0].data;
      const source = links[0].attribs.href

      mappings.push({
        addr,
        source,
      });
    }

    return mappings;
  }

  console.log('error: addresses and links length not equal');
  return false;
}

function getInfo(url) {
  request(url, (err, res, html) => {
    const info = {};

    if (!err) {
      const $ = cheerio.load(html);
      const buckets = $('.keyvalset');
      const bTitle = buckets.eq(0).find('.liv-bullet').text();
      const bAttrs = buckets.eq(0).find('li');

      const attrsList = {};
      for (let i = 0; i < bAttrs.length; i ++) {
        const key = bAttrs.eq(i).find('strong').text();
        const value = bAttrs.eq(i).find('span').text();

        attrsList[key] = value;
      }
      debugger;


    } else {

      console.log('error: can not fetch info for ' + url);
    }

  });
}

app.get('/scrape', function(req, res) {
  request(FETCH_URL, function(error, response, html) {
    if (!error) {
      let $ = cheerio.load(html);

      const addresses = $("article h1 .result-address");
      const links = $('article .mediaImg a');

      const addressLinkMappings = buildAddressLinkMappings(addresses, links);
      // console.dir(addressLinkMappings);

      const url = addressLinkMappings[0].source;
      console.log(url);
      getInfo(url);
    }
  })
})

app.listen('8081')
console.log('Magic happens on port 8081');
exports = module.exports = app;
