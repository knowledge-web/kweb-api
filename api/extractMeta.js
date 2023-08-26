// birth.date
// birth.place
// death.date
// death.place
function extractPlaceDate (string) { // FIXME XXX isn't this in metadata already? ...should be.
  if (!string) return { }
  let [date, place] = string.split(';')
  if (place) return { date: date.trim(), place: place.trim() }
  // work with "," instead of ";"
  const regex = /(.*\d{4}),\s(.*)/
  const match = string.match(regex)
  if (!match || match.length < 3) return { } // Pattern not found
  date = match[1].trim()
  place = match[2].trim()
  return { date, place }
}

function extractMeta (content) {
  const meta = {};

  let txt = content.md || content.html;
  if (!txt) return {};

  txt = txt.replaceAll(/achievement\(s\):/ig, 'achievements:'); // standardize
  txt = txt.replaceAll(/DATE\/PLACE OF DEATH\/AGE AT DEATH:/ig, 'DATE AND PLACE OF DEATH:');

  txt = txt.replaceAll(/DATE AND PLACE OF BIRTH:/ig, 'Born:');
  txt = txt.replaceAll(/DATE AND PLACE OF DEATH:/ig, 'Died:');

  const extract = [
    'NAME',
    'OTHER-NAME',
    'INVENTED/BEGAN',


    // DATE INVENTED/BEGAN
    // PLACE INVENTED/BEGAN
    'ACHIEVEMENTS',
    'NICKNAME/ALIAS',
    'BORN',
    'DIED',
    'CATEGORY',
    'DISCIPLINE',
    'FIELD',
    'LANGUAGE',
    'PARENTS',
    'SIBLINGS',
    'SPOUSE',
    'CHILDREN',
    'EDUCATION',
    'MAJOR WORK',
    // 'LIFE AND TIMES', // FIXME always several lines...
    // 'DEAILS', // things only? // FIXME always several lines...
    'ASSESSMENT',
    'EXTRA CONNECTIONS',
    'ONELINER'
  ].map(s => s.toLowerCase());

  for (const key of extract) {
    const pat = key + ':\\s+(.*)';
    let match = (new RegExp(pat, 'ig').exec(txt) || ['', ''])[1];
    if (!match) continue;
    match = match.split('<br />')[0];
    match = match.split('<br/>')[0];
    match = match.replace(/<\/?[^>]+(>|$)/g, '');
    meta[key] = match;
  }

  meta.birth = extractPlaceDate(meta.born)
  meta.death = extractPlaceDate(meta.died)
  delete meta.born
  delete meta.died

  console.log(meta.birth)

  return meta
}
exports.extractMeta = extractMeta
