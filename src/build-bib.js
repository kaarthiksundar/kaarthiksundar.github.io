var bibtexParse = require('@orcid/bibtex-parse-js');
var fs = require('fs'); 

var getNamesWithInits = function (authors) {
    var names = authors.split(' ');
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
    return authors.split(' and ').map(
        function(name) { 
            return getNamesWithInits(name); 
        });
};

var getYear = function(date) { 
    return date.substring(0, 4); 
};

var cleanTitle = function(title) {
    return title.replace('\\&', '&');
};

function getBibCitation(entry) {
    var citeStr = '@' + entry['entryType'] + '{' + entry['citationKey'] + ',\n ';
    var entryTags = entry['entryTags'];
    for (let key in entryTags) {
        if (key == 'keywords') continue;
        citeStr += key.toString() + '={' + entryTags[key] + '},\n ';
    }
    citeStr += '}';
    return citeStr;
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
        return entry['eprint'];
    return '';
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
    var cite = getBibCitation(entry);
    var entryTags = entry['entryTags'];
    var entryType = entryTags['keywords']
    var JCtitle = getJCTitle(entryTags);
    var authors = parseAuthors(entryTags['author']);
    jsonEntry = {
        'type': entryType,
        'authors': authors.slice(0, -1).join(', ')+' and '+ authors.slice(-1),
        'JCTitle': JCtitle,
        'year': getYear(entryTags['date']),
        'paperTitle': cleanTitle(entryTags['title']),
        'doi': getDOI(entryTags),
        'arxiv': getArxivId(entryTags),
        'cite': cite
    };
    jsonEntries.push(jsonEntry);
}

fs.writeFile('./assets/pubs.json', 
    JSON.stringify(jsonEntries, null, 2), 
    function(err) {
    if (err) console.log(err);
});
