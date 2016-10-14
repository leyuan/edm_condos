const express = require('express');
const path = require('path');
const request = require('request');
const cheerio = require('cheerio');
const esClient = require('./esclient');

const app = express();
const url1 = 'https://www.edmontonrealestate.pro/idx/search.html?quick_search=true&search_universal=downtown&idx=ereb&minimum_price=200000&maximum_price=350000&search_reduced=&minimum_year=&maximum_year=&minimum_bedrooms_above_grade=2&maximum_bedrooms_above_grade=&minimum_bedrooms=&maximum_bedrooms=&minimum_full_bathrooms=&maximum_full_bathrooms=&minimum_half_bathrooms=&maximum_half_bathrooms=&minimum_sqft=&maximum_sqft=&minimum_acres=&maximum_acres=&minimum_stories=&maximum_stories=';
const url2 = 'https://www.edmontonrealestate.pro/idx/search.html?quick_search=true&search_universal=downtown&idx=ereb&minimum_price=200000&maximum_price=350000&search_reduced=&minimum_year=&maximum_year=&minimum_bedrooms_above_grade=2&maximum_bedrooms_above_grade=&minimum_bedrooms=&maximum_bedrooms=&minimum_full_bathrooms=&maximum_full_bathrooms=&minimum_half_bathrooms=&maximum_half_bathrooms=&minimum_sqft=&maximum_sqft=&minimum_acres=&maximum_acres=&minimum_stories=&maximum_stories=&p=2';
const url3 = 'https://www.edmontonrealestate.pro/idx/search.html?quick_search=true&search_universal=downtown&idx=ereb&minimum_price=200000&maximum_price=350000&search_reduced=&minimum_year=&maximum_year=&minimum_bedrooms_above_grade=2&maximum_bedrooms_above_grade=&minimum_bedrooms=&maximum_bedrooms=&minimum_full_bathrooms=&maximum_full_bathrooms=&minimum_half_bathrooms=&maximum_half_bathrooms=&minimum_sqft=&maximum_sqft=&minimum_acres=&maximum_acres=&minimum_stories=&maximum_stories=&p=3';
const URLs = [url1, url2, url3];

function buildAddressLinkMappings(addresses, links) {
  const mappings = [];
  if (addresses.length != 0 && addresses.length === links.length) {
    for (let i = 0; i < addresses.length; i ++) {
      const addr = addresses[i].children[0].data;
      const source = links[i].attribs.href

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

function createIdFromAddress(address) {
  return address.replace(/ /g, '_');
}

function checkCondoExist(address, nonExistCallback) {
  esClient.exists({
    index: 'edm_condos',
    type: 'condos',
    id: createIdFromAddress(address)
  }, function (err, exists) {
    if (exists === false) {
      nonExistCallback();
    } else {
      console.log('condo exist, skipping');
    }
  });
}

function processCondo(url, address) {
  request(url, (err, res, html) => {
    const info = {};

    if (!err) {
      const $ = cheerio.load(html);
      const buckets = $('.keyvalset');
      const condoAttributes = {};
      condoAttributes['Address'] = address;
      condoAttributes['Url'] = url;
      // get all buckets
      for (let i = 0; i < buckets.length; i ++) {
        const bTitle = buckets.eq(i).find('.liv-bullet').text();
        const bAttrs = buckets.eq(i).find('li');

        const attrsList = {};
        for (let i = 0; i < bAttrs.length; i ++) {
          const key = bAttrs.eq(i).find('strong').text();
          const value = bAttrs.eq(i).find('span').text();

          attrsList[key] = value;
        }
        condoAttributes[bTitle] = attrsList;
      }
      // use condo address as id
      const id = createIdFromAddress(address);
      saveCondo(id, condoAttributes);

    } else {

      console.log('error: can not fetch info for ' + url);
      console.log('error:' + err);
    }

  });
}

function saveCondo(id, body, callback=null) {
  const data = {
    index: 'edm_condos',
    type: 'condos',
    body: body,
  };

  if (id !== 'Address_Unavailable') {
    data.id = id;
  }

  esClient.create(data, function (err, response) {
    if (!err) {
      // console.log(response);
      console.log('condo saved');
      if (typeof callback === 'function') {
        callback();
      }
    } else {
      console.log(err);
    }
  });
}

app.get('/api/condos', function (req, res) {
  esClient.search({
    index: 'edm_condos',
    type: 'condos',
    size: 2
  }, function (error, response) {
    if (!error) {
      const condos = [];
      const condoData = response.hits.hits;
      console.log(condoData);

      condoData.map((condo) => {
        const stub = {
          addr: condo["_source"]["Address"]
        };
        condos.push(stub);
      });

      res.send(condos);
    } else {
      console.log(error);
      res.send('error ..');
    }
  });

  // res.send('fetching condos ...');
});

app.get('/scrape', function(req, res) {
  URLs.map((url) => {
    // console.log(url);
    request(url, function(error, response, html) {
      if (!error) {
        let $ = cheerio.load(html);

        // build [{addr: url}, ..] link mappings for all condos in page 1
        const addresses = $("article h1 .result-address");
        const links = $('article .mediaImg a');
        const addressLinkMappings = buildAddressLinkMappings(addresses, links);

        // debugger;

        addressLinkMappings.map(function (condo) {
          // get first condo address and url
          const address = condo.addr;
          const url = condo.source;

          // console.log(address);

          // check if this condo has already been stored, if not exist, process it.
          checkCondoExist(address, function () {
            processCondo(url, address);
          });
        });

      }
    });
  });
  res.send('helllllo edmonton!!!');
})

app.use('/', express.static(path.join(__dirname, 'public')));

app.listen('8081')
console.log('Magic happens on port 8081');
exports = module.exports = app;
