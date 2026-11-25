var bibtexParse = require('@orcid/bibtex-parse-js');
var fs = require('fs'); 

var normalizeWhitespace = function(value) {
    return value.replace(/\s+/g, ' ').trim();
};

var getNamesWithInits = function (authors) {
    var names = normalizeWhitespace(authors).split(' ').map(
        function(name) {
            return name.replace(/^\{|\}$/g, '')
        }
    );
    
    var shortName = "";
    for (var i = 0; i < names.length - 1; i++) {
        if (names[i].slice(-1) == ".") {
            shortName += names[i].substring(0, 1).toUpperCase() + ". ";
            continue;
        }
        if (names[i] == names[i].toUpperCase()) {
            shortName += names[i].split("").join(". ") + ". ";
            continue;
        }
        shortName += names[i].substring(0, 1).toUpperCase() + ". ";
    }

    replaceChars = { '{\\~{n}}' : '\u00f1' }
    for (var key in replaceChars) 
        shortName += names[names.length - 1].replace(
            key, replaceChars[key]);
    return shortName;
};

var parseAuthors = function(authors) {
    return authors.split(/\s+and\s+/).map(
        function(name) { 
            return getNamesWithInits(name); 
        });
};

var parseFullAuthors = function(authors) {
    return authors.split(/\s+and\s+/).map(normalizeWhitespace)
};

var getYear = function(date) { 
    return date.substring(0, 4); 
};

var cleanTitle = function(title) {
    var temp = title.replace('--', '—')
    temp = temp.replace('$A^*$', 'A\u002A')
    temp = temp.replace('A$^*$', 'A\u002A')
    temp = temp.replace(/\{MIP\}s/g, 'MIPs')
    return temp.replace('\\&', '&');
};

function getJCTitle(entry) {
    if (entry.hasOwnProperty('journaltitle')) {
        if (entry['journaltitle'] == 'IFAC-PapersOnLine')
            return cleanTitle(entry['note']);
        return cleanTitle(entry['journaltitle']);
    }
    if (entry.hasOwnProperty('booktitle'))
        return cleanTitle(entry['booktitle']);
    return '';
};

function getDOI(entry) {
    if (entry.hasOwnProperty('doi'))
        return entry['doi'];
    return '';
};

function getArxivId(entry) {
    if (entry.hasOwnProperty('eprint'))
        return [entry['eprint'], entry['eprinttype']];
    return ['', ''];
};

var rawData = fs.readFileSync('./assets/kspubs.bib').toString();
var entries = bibtexParse.toJSON(rawData);
var bibEntries = entries.filter(
    function(entry) {
        var entryType = entry['entryType']
        return (entryType == 'Article' || entryType == 'InProceedings');
});

var jsonEntries = [];

for(var i = 0; i < bibEntries.length; ++i) {
    var entry = bibEntries[i];
    var entryTags = entry['entryTags'];
    var entryType = entryTags['keywords'];
    var JCtitle = getJCTitle(entryTags);
    var authors = parseAuthors(entryTags['author']);
    var fullAuthors = parseFullAuthors(entryTags['author']);

    jsonEntry = {
        'type': entryType,
        'authors': authors.slice(0, -1).join(', ')+' and '+ authors.slice(-1),
        'fullAuthors': fullAuthors.slice(0, -1).join(', ')+' and '+ fullAuthors.slice(-1),
        'JCTitle': JCtitle,
        'year': getYear(entryTags['date']),
        'paperTitle': cleanTitle(entryTags['title']),
        'doi': getDOI(entryTags),
        'arxiv': getArxivId(entryTags)
    };
    jsonEntries.push(jsonEntry);
}

fs.writeFile('./assets/pubs.json', 
    JSON.stringify(jsonEntries, null, 2), 
    function(err) {
    if (err) console.log(err);
});
