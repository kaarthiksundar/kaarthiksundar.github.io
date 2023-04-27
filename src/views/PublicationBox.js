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

var JView = function (paper) {
    // 'fa-li' is replaced by 'left--2 absolute w2 tc' 
    var icon = m('span', { class: 'left--2 absolute w2 tc' },
        m(Icon, { name: 'file', class: 'light-red'}));

    var children = [
        icon,
        m('span', {class: 'black'}, paper.paperTitle), m('br'),
        '   ', paper.authors, m('br'),
        '   ', paper.JCTitle, ', ', paper.year, m('br')
    ]
    if (paper.doi != "") {
        children.push('  ');
        children.push(m('a', {class: 'f7 link dim br2 ba ph1 mb2 dib light-red', 
            href: 'https://www.doi.org/' + paper.doi}, 'DOI'));
    }
    if (paper.arxiv != "") {
        children.push('  ');
        children.push(m('a', {class: 'f7 link dim br2 ba ph1 mb2 dib light-red', 
            href: 'https://arxiv.org/abs/' + paper.arxiv}, 'arXiv'));
    }
    children.push(' ');
    var btn = m('a', {class: 'f7 link dim br2 ba ph1 mb2 dib light-red', href: 'javascript:void(0)',
        onclick: function() {
            const dummy = document.createElement('textarea');
            dummy.value = paper.cite;
            document.body.appendChild(dummy);
            dummy.select();
            document.execCommand('copy');
            document.body.removeChild(dummy);
        }
    }, 'Copy BibTeX');
    children.push(btn);

    return m('li', { class: 'pa2 lh-copy'}, children)
};

var CView = function (paper) {
    // 'fa-li' is replaced by 'left--2 absolute w2 tc' 
    var icon = m('span', { class: 'left--2 absolute w2 tc' },
        m(Icon, { name: 'file', class: 'green'}));

    var children = [
        icon,
        m('span', {class: 'black'}, paper.paperTitle), m('br'),
        '   ', paper.authors, m('br'),
        '   ', paper.JCTitle, ', ', paper.year, m('br')
    ]
    if (paper.doi != "") {
        children.push('  ');
        children.push(m('a', {class: 'f7 link dim br2 ba ph1 mb2 dib green', 
            href: 'https://www.doi.org/' + paper.doi}, 'DOI'));
    }
    if (paper.arxiv != "") {
        children.push('  ');
        children.push(m('a', {class: 'f7 link dim br2 ba ph1 mb2 dib green', 
            href: 'https://arxiv.org/abs/' + paper.arxiv}, 'arXiv'));
    }
    children.push(' ');
    var btn = m('a', {class: 'f7 link dim br2 ba ph1 mb2 dib green', href: 'javascript:void(0)',
        onclick: function() {
            const dummy = document.createElement('textarea');
            dummy.value = paper.cite;
            document.body.appendChild(dummy);
            dummy.select();
            document.execCommand('copy');
            document.body.removeChild(dummy);
        }
    }, 'Copy BibTeX');
    children.push(btn);

    return m('li', { class: 'pa2 lh-copy'}, children)
};

var PreprintView = function (paper) {
    // 'fa-li' is replaced by 'left--2 absolute w2 tc' 
    var icon = m('span', { class: 'left--2 absolute w2 tc' },
        m(Icon, { name: 'file', class: 'blue'}));

    var children = [
        icon,
        m('span', {class: 'black'}, paper.paperTitle), m('br'),
        '   ', paper.authors, '. ', paper.year, m('br')
    ]
    if (paper.arxiv != "") {
        children.push('  ');
        children.push(m('a', {class: 'f7 link dim br2 ba ph1 mb2 dib blue', 
            href: 'https://arxiv.org/abs/' + paper.arxiv}, 'arXiv'));
    }
    children.push(' ');
    var btn = m('a', {class: 'f7 link dim br2 ba ph1 mb2 dib blue', href: 'javascript:void(0)',
    onclick: function() {
        const dummy = document.createElement('textarea');
        dummy.value = paper.cite;
        document.body.appendChild(dummy);
        dummy.select();
        document.execCommand('copy');
        document.body.removeChild(dummy);
    }
}, 'Copy BibTeX');
    children.push(btn);

    return m('li', { class: 'pa2 lh-copy'}, children)
}

module.exports = {
    oninit: function() {
        if (!Publication.loaded) Publication.loadList()
        Publication.selectedYearValue = 1;
        Publication.searchString = '';
    },
    view: function () {
        var allYears = Publication.getYears();
        allYears.unshift('All');
        
        var options = allYears.map(function (item, index) {
            return {value: index + 1, name: item}
        });

        var dropdown = m('select', { id: 'year',
            onchange: function(ev) { Publication.selectedYearValue = parseInt(ev.target.value); } 
            },
            options.map((row) => {
                return m('option', {
                    value: row.value, selected: row.value == Publication.selectedYearValue
                }, row.name)
            })
        );

        var searchbox =  m('input', {
            placeholder: 'Type to search...',
            oninput: function() { 
                Publication.searchString = this.value
            } 
        });

        var searchdiv = m('div', {class: 'f6 dib ml4 mb4'}, [
            m(Icon, {name: 'search'}), 
            m('span', {class: 'f6 f5-ns pr2'}, ' '), 
            searchbox
        ])
        var dddiv = m('div', {class: 'f6 dib ml4 mb4'}, [m('span', {class: 'f6 f5-ns pr2'}, 'Select year :'), dropdown])
        
        var chosenYear = options.filter( (item) => (parseInt(item.value) == Publication.selectedYearValue))[0].name;

        var papers = Publication.getPubs(chosenYear);
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
        var conflist = m('ul', { class: 'list pl0 ml4 relative f6 f5-ns' }, conferences.map(CView));
        var confdiv = m('div', {id: 'conference', class: 'pa3 ph5-ns w-100' }, [conftitle, conflist]);

        var journaltitle = m('h3', {class: 'f6 ttu tracked nt2 light-red'}, 'JOURNAL ARTICLES');
        // 'fa-ul' replaced by 'list pl0 ml4 relative'
        var journallist = m('ul', { class: 'list pl0 ml4 relative f6 f5-ns' }, journals.map(JView));
        var journaldiv = m('div', {id: 'journal', class: 'pa3 ph5-ns w-100' }, [journaltitle, journallist]);

        var preprinttitle = m('h3', {class: 'f6 ttu tracked nt2 blue'}, 'PREPRINTS');
        // 'fa-ul' replaced by 'list pl0 ml4 relative'
        var preprintlist = m('ul', {class: 'list pl0 ml4 relative f6 f5-ns' }, preprints.map(PreprintView))
        var preprintdiv = m('div', {id: 'preprint', class: 'pa3 ph5-ns w-100' }, [preprinttitle, preprintlist])

        var paperdiv = []
        if (preprints.length != 0) 
            paperdiv.push(preprintdiv)
        if (journals.length != 0)
            paperdiv.push(journaldiv)
        if (conferences.length != 0)
            paperdiv.push(confdiv)

        var numentries = preprints.length + journals.length + conferences.length
        console.log(numentries)
        var numentriesdiv = m('div', {class: 'f6 dib ml4 mb4'}, 
            m('span', {class: 'f6 f5-ns pr2'}, 'Number of entries : ' + numentries))
        
        return m('div', {class: 'pb3 nt5-ns'}, [dddiv, searchdiv, numentriesdiv, paperdiv])
    }
}