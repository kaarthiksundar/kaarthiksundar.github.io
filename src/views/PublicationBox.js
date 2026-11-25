var m = require('mithril');
var Publication = require('../models/Publications');
var runSearch = require('./PublicationSearch')

const icons = {
    'search': (cssClass) => `<svg class="${cssClass}" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>`,
    'file': (cssClass) => `<svg class="${cssClass}" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>`
}
  
const Icon = {
    view: (v) => {
        if (v.attrs.name in icons) {
            let cssClass = v.attrs.class || ''
            return m.trust(icons[v.attrs.name](cssClass))
        }
        return ''
    }
}

function escapeRegExp(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function highlightedText(value, field) {
    var text = String(value == null ? '' : value)
    var terms = runSearch.getHighlightTerms(Publication.searchString, field)
        .filter(function (term, index, allTerms) {
            return term && allTerms.indexOf(term) == index
        })
        .sort(function (a, b) {
            return b.length - a.length
        })

    if (terms.length == 0) return text

    var pattern = new RegExp('(' + terms.map(escapeRegExp).join('|') + ')', 'gi')
    return text.split(pattern).map(function (part, index) {
        return index % 2 == 1
            ? m('mark', {class: 'search-highlight'}, part)
            : part
    })
}

function searchQueryFromUrl() {
    return new URLSearchParams(window.location.search).get('q') || ''
}

function updateSearchUrl(query) {
    var url = new URL(window.location.href)
    if (query) {
        url.searchParams.set('q', query)
    } else {
        url.searchParams.delete('q')
    }
    window.history.replaceState(window.history.state, '', url.pathname + url.search + url.hash)
}

var JView = function (paper) {
    // 'fa-li' is replaced by 'left--2 absolute w2 tc' 
    var icon = m('span', { class: 'left--2 absolute w2 tc' },
        m(Icon, { name: 'file', class: 'light-red'}));

    var children = [
        icon,
        m('span', {class: 'black'}, highlightedText(paper.paperTitle, 'title')), m('br'),
        '   ', m('span', {class: 'black-60'}, highlightedText(paper.authors, 'author')), m('br'),
        '   ', highlightedText(paper.JCTitle, 'venue'), ', ', highlightedText(paper.year, 'year'), m('br')
    ]
    if (paper.doi != "") {
        children.push('  ');
        children.push(m('a', {class: 'f7 link dim br2 ba ph1 mb2 dib light-red', 
            href: 'https://www.doi.org/' + paper.doi}, 'DOI'));
    }
    if (paper.arxiv[1] == "arXiv") {
        children.push('  ');
        children.push(m('a', {class: 'f7 link dim br2 ba ph1 mb2 dib light-red',  
            href: 'https://arxiv.org/abs/' + paper.arxiv[0]}, 'arXiv'));
    }
    if (paper.arxiv[1] == "ssrn") {
        children.push('  ');
        children.push(m('a', {class: 'f7 link dim br2 ba ph1 mb2 dib light-red',  
            href: 'https://ssrn.com/abstract=' + paper.arxiv[0]}, 'SSRN'));
    }
    return m('li', { class: 'pa2 lh-copy'}, children)
};

var CView = function (paper) {
    // 'fa-li' is replaced by 'left--2 absolute w2 tc' 
    var icon = m('span', { class: 'left--2 absolute w2 tc' },
        m(Icon, { name: 'file', class: 'green'}));

    var children = [
        icon,
        m('span', {class: 'black'}, highlightedText(paper.paperTitle, 'title')), m('br'),
        '   ', m('span', {class: 'black-60'}, highlightedText(paper.authors, 'author')), m('br'),
        '   ', highlightedText(paper.JCTitle, 'venue'), ', ', highlightedText(paper.year, 'year'), m('br')
    ]
    if (paper.doi != "") {
        children.push('  ');
        children.push(m('a', {class: 'f7 link dim br2 ba ph1 mb2 dib green', 
            href: 'https://www.doi.org/' + paper.doi}, 'DOI'));
    }
    if (paper.arxiv[1] == "arXiv") {
        children.push('  ');
        children.push(m('a', {class: 'f7 link dim br2 ba ph1 mb2 dib green',  
            href: 'https://arxiv.org/abs/' + paper.arxiv[0]}, 'arXiv'));
    }
    if (paper.arxiv[1] == "ssrn") {
        children.push('  ');
        children.push(m('a', {class: 'f7 link dim br2 ba ph1 mb2 dib green',  
            href: 'https://ssrn.com/abstract=' + paper.arxiv[0]}, 'SSRN'));
    }
    return m('li', { class: 'pa2 lh-copy'}, children)
};

var PreprintView = function (paper) {
    // 'fa-li' is replaced by 'left--2 absolute w2 tc' 
    var icon = m('span', { class: 'left--2 absolute w2 tc' },
        m(Icon, { name: 'file', class: 'blue'}));

    var children = [
        icon,
        m('span', {class: 'black'}, highlightedText(paper.paperTitle, 'title')), m('br'),
        '   ', m('span', {class: 'black-60'}, highlightedText(paper.authors, 'author')), '. ', highlightedText(paper.year, 'year'), m('br')
    ]
    
    if (paper.arxiv[1] == "arXiv") {
        children.push('  ');
        children.push(m('a', {class: 'f7 link dim br2 ba ph1 mb2 dib blue', 
            href: 'https://arxiv.org/abs/' + paper.arxiv[0]}, 'arXiv'));
    }
    if (paper.arxiv[1] == "ssrn") {
        children.push('  ');
        children.push(m('a', {class: 'f7 link dim br2 ba ph1 mb2 dib blue', 
            href: 'https://ssrn.com/abstract=' + paper.arxiv[0]}, 'SSRN'));
    }
    return m('li', { class: 'pa2 lh-copy'}, children)
}

module.exports = {
    oninit: function() {
        if (!Publication.loaded) Publication.loadList()
        Publication.searchString = searchQueryFromUrl();
    },
    view: function () {
        var searchbox = m('input', {
            type: 'search',
            value: Publication.searchString,
            placeholder: 'Search title, author, venue, or year...',
            'aria-label': 'Search publications',
            'aria-describedby': 'publication-search-help',
            autocomplete: 'off',
            class: 'publication-search-input pa2 ba b--black-20 br2',
            oninput: function (event) {
                Publication.searchString = event.currentTarget.value
                updateSearchUrl(Publication.searchString)
            }
        });

        var searchControls = [m('div', {class: 'publication-search-field'}, [
            m('span', {class: 'publication-search-icon', 'aria-hidden': 'true'}, m(Icon, {name: 'search'})),
            searchbox
        ])]
        if (Publication.searchString != '') {
            searchControls.push(m('button', {
                type: 'button',
                class: 'ml2 pa2 bn bg-transparent blue pointer underline-hover',
                onclick: function () {
                    Publication.searchString = ''
                    updateSearchUrl('')
                }
            }, 'Clear'))
        }

        var searchdiv = m('div', {class: 'publication-search f6 pa3 pb0 ph5-ns'},
            m('div', {class: 'publication-search-control'}, searchControls))
        var searchHelp = m('div', {id: 'publication-search-help', class: 'f7 f6-ns black-60 ph3 ph5-ns mb4 lh-copy'}, [
            'Try ', m('code', 'year:2024'), ', ',
            m('code', 'author:sundar'), ', ',
            m('code', 'title:"gas flow"'), ', or ',
            m('code', 'type:journal'), '. Use quotes for an exact phrase.'
        ])
        var papers = Publication.getPubs('All');
        var conferences = papers[0];
        var journals = papers[1];
        var preprints = papers[2];

        if (Publication.searchString != '') {
            conferences = runSearch(Publication.searchString, conferences);
            journals = runSearch(Publication.searchString, journals);
            preprints = runSearch(Publication.searchString, preprints);
        }

        var conftitle = m('h3', {class: 'f6 ttu tracked nt2 green'}, 'CONFERENCE PROCEEDINGS');
        // 'fa-ul' replaced by 'list pl0 ml4 relative'
        var conflist = m('ul', { class: 'site-copy list pl0 ml4 relative' }, conferences.map(CView));
        var confdiv = m('div', {id: 'conference', class: 'publication-section pa3 ph5-ns w-100', tabindex: '-1'}, [conftitle, conflist]);

        var journaltitle = m('h3', {class: 'f6 ttu tracked nt2 light-red'}, 'JOURNAL ARTICLES');
        // 'fa-ul' replaced by 'list pl0 ml4 relative'
        var journallist = m('ul', { class: 'site-copy list pl0 ml4 relative' }, journals.map(JView));
        var journaldiv = m('div', {id: 'journal', class: 'publication-section pa3 ph5-ns w-100', tabindex: '-1'}, [journaltitle, journallist]);

        var preprinttitle = m('h3', {class: 'f6 ttu tracked nt2 blue'}, 'PREPRINTS');
        // 'fa-ul' replaced by 'list pl0 ml4 relative'
        var preprintlist = m('ul', {class: 'site-copy list pl0 ml4 relative' }, preprints.map(PreprintView))
        var preprintdiv = m('div', {id: 'preprint', class: 'publication-section pa3 ph5-ns w-100', tabindex: '-1'}, [preprinttitle, preprintlist])

        var paperdiv = []
        if (preprints.length != 0) 
            paperdiv.push(preprintdiv)
        if (journals.length != 0)
            paperdiv.push(journaldiv)
        if (conferences.length != 0)
            paperdiv.push(confdiv)

        var numentries = preprints.length + journals.length + conferences.length
        var publicationCounts = [
            {count: preprints.length, singular: 'preprint', plural: 'preprints', color: 'blue', target: 'preprint'},
            {count: journals.length, singular: 'journal article', plural: 'journal articles', color: 'dark-red', target: 'journal'},
            {count: conferences.length, singular: 'conference paper', plural: 'conference papers', color: 'dark-green', target: 'conference'}
        ].filter(function (item) {
            return item.count > 0
        })

        var countList = m('ul', {
            class: 'list pa0 mt2 mb0',
            'aria-label': 'Publication counts by type'
        }, publicationCounts.map(function (item) {
            var label = item.count == 1 ? item.singular : item.plural
            return m('li', {class: 'dib mr2 mb2'},
                m('button', {
                    type: 'button',
                    class: 'dib ba br2 ph2 pv1 bg-transparent pointer dim ' + item.color,
                    onclick: function () {
                        var section = document.getElementById(item.target)
                        if (section) {
                            section.scrollIntoView({behavior: 'smooth', block: 'start'})
                            section.focus({preventScroll: true})
                        }
                    },
                    'aria-label': 'Go to ' + label
                }, [
                    m('strong', item.count), ' ', label
                ]))
        }))

        var numentriesdiv = m('div', {class: 'f6 ph3 ph5-ns mb3'}, [
            m('div', {
                class: 'f6 f5-ns',
                role: 'status',
                'aria-live': 'polite',
                'aria-atomic': 'true'
            }, 'Showing ' + numentries + ' publication' + (numentries == 1 ? '' : 's')),
            countList
        ])

        if (numentries == 0) {
            paperdiv.push(m('p', {class: 'ph3 ph5-ns f6 f5-ns black-60'}, 'No publications match your search.'))
        }
        
        return m('div', {class: 'pb3 nt5-ns'}, [
            m('h1', {class: 'visually-hidden'}, 'Publications'),
            searchdiv,
            searchHelp,
            numentriesdiv,
            paperdiv
        ])
    }
}
