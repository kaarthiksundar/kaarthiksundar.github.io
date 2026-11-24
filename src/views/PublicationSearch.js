const fieldAliases = {
    title: ['paperTitle'],
    author: ['authors', 'fullAuthors'],
    venue: ['JCTitle'],
    year: ['year'],
    type: ['type'],
    doi: ['doi'],
    id: ['arxiv']
}

const allSearchFields = [
    'type', 'paperTitle', 'JCTitle', 'year', 'authors',
    'fullAuthors', 'doi', 'arxiv'
]

function normalize(value) {
    return String(value == null ? '' : value)
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim()
}

function fieldText(publication, fields) {
    return fields.map(function (field) {
        var value = publication[field]
        return Array.isArray(value) ? value.join(' ') : value
    }).map(normalize).join(' ')
}

function parseQuery(query) {
    var terms = []
    var pattern = /(?:([a-z]+):)?(?:"([^"]+)"|(\S+))/gi
    var match

    while ((match = pattern.exec(query)) !== null) {
        var field = match[1] ? match[1].toLowerCase() : null
        var value = normalize(match[2] || match[3])
        if (value) terms.push({field: field, value: value})
    }
    return terms
}

function runSearch(searchValue, publications) {
    var terms = parseQuery(searchValue)
    if (terms.length === 0) return publications

    return publications.filter(function (publication) {
        return terms.every(function (term) {
            var fields = term.field && fieldAliases[term.field]
                ? fieldAliases[term.field]
                : allSearchFields
            return fieldText(publication, fields).includes(term.value)
        })
    })
}

module.exports = runSearch
