//
// Usage: cut data.tsv -f2 | xargs -I % node wikidata-fetcher.js %
//

const axios = require('axios');
const fs = require('fs');

async function lookupWikidataLocation(locationId) {
    const url = `https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${locationId}&format=json&props=labels|claims&languages=en&origin=*`;
    const response = await axios.get(url);
    const data = response.data;
    const entity = data.entities[locationId];
    const placeName = entity.labels.en.value;
    const countryId = entity.claims.P17 ? entity.claims.P17[0].mainsnak.datavalue.value.id : null;
    const countryResponse = await axios.get(`https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${countryId}&format=json&props=labels&languages=en&origin=*`);
    const countryData = countryResponse.data;
    const countryName = countryData.entities[countryId] ? countryData.entities[countryId].labels.en.value : null;
    return [ placeName, countryName ]
}

function formatDate(dateString) {
    return dateString.substring(1, 11);
}

async function fetchWikidataDetails(wikidataId) {
    let cache = {};
    try {
        const cacheData = fs.readFileSync('wikidata-cache.json', 'utf8');
        cache = JSON.parse(cacheData);
    } catch (error) {
        console.log('No cache file found. Creating a new one.');
    }

    if (cache[wikidataId]) {
        return cache[wikidataId];
    }

    const url = `https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${wikidataId}&format=json&props=claims&origin=*`;
    const response = await axios.get(url)
    const data = response.data;

    if (!data.entities || !data.entities[wikidataId]) {
        console.error('Invalid Wikidata ID or no data returned from API');
        return null;
    }

    const birthDateClaim = data.entities[wikidataId].claims.P569;
    const deathDateClaim = data.entities[wikidataId].claims.P570;
    const birthPlaceClaim = data.entities[wikidataId].claims.P19;
    const deathPlaceClaim = data.entities[wikidataId].claims.P20;
    const placesLivedClaim = data.entities[wikidataId].claims.P551;

    const birthDate = birthDateClaim ? formatDate(birthDateClaim[0].mainsnak.datavalue.value.time) : null;
    const deathDate = deathDateClaim ? formatDate(deathDateClaim[0].mainsnak.datavalue.value.time) : null;

    const birthPlaceId = birthPlaceClaim ? birthPlaceClaim[0].mainsnak.datavalue.value.id : null;
    const deathPlaceId = deathPlaceClaim ? deathPlaceClaim[0].mainsnak.datavalue.value.id : null;

    const birthPlace = birthPlaceId ? await lookupWikidataLocation(birthPlaceId) : null;
    const deathPlace = deathPlaceId ? await lookupWikidataLocation(deathPlaceId) : null;

    const placesLived = placesLivedClaim ? await Promise.all(placesLivedClaim.map(async (claim) => {
        const placeId = claim.mainsnak.datavalue.value.id;
        const { placeName, countryName } = await lookupWikidataLocation(placeId);
        const startDate = claim.qualifiers && claim.qualifiers.P580 ? formatDate(claim.qualifiers.P580[0].datavalue.value.time) : null;
        const endDate = claim.qualifiers && claim.qualifiers.P582 ? formatDate(claim.qualifiers.P582[0].datavalue.value.time) : null;
        return { placeName, countryName, startDate, endDate };
    })) : [];

    const details = {
        birthDate,
        deathDate,
        birthPlace,
        deathPlace,
        placesLived
    };

    cache[wikidataId] = details;
    fs.writeFileSync('wikidata-cache.json', JSON.stringify(cache));

    return details;
}

// module.exports = fetchWikidataDetails;

// get cli argument
const args = process.argv.slice(2)
const id = args[0]

fetchWikidataDetails(id).then(() => {
    console.log('done:', id)
})

// const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
// const lines = fs.readFileSync('data.tsv', 'utf8').split('\n').filter((line) => line)
// lines.map(async (line) => {
//   const [link, id] = line.split('\t')
//   if (!id) return
// //   console.log(link, id)
  
//   await fetchWikidataDetails(id)
//   await delay(1000)
// })
