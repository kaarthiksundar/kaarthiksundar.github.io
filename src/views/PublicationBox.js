var m = require('mithril');
var Publication = require('../models/Publications');

var JView = function (paper) {
    var icon = m('span', { class: 'fa-li' },
        m('i', { class: 'fas fa-file light-red'}));

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

    return m('li', { class: 'pa2 lh-copy'}, children)
};

var CView = function (paper) {
    var icon = m('span', { class: 'fa-li' },
        m('i', { class: 'fas fa-file green'}));

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

    return m('li', { class: 'pa2 lh-copy'}, children)
};

var PreprintView = function (paper) {
    var icon = m('span', { class: 'fa-li' },
        m('i', {class: 'fas fa-file blue'}));

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
    return m('li', { class: 'pa2 lh-copy'}, children)
}

function getPubs(pubs, year) {
    if (year == 'All') {
        conferences = pubs.filter( function (pub) {
            return (pub.type == "conference")
        });
        journals = pubs.filter( function (pub) {
            return (pub.type == "journal")
        });
        preprints = pubs.filter( function (pub) {
            return (pub.type == "preprint")
        });
        conferences.sort((a, b) => (a.year > b.year) ? -1 : 1)
        journals.sort((a, b) => (a.year > b.year) ? -1 : 1)
        preprints.sort((a, b) => (a.year > b.year) ? -1 : 1)

        return [conferences, journals, preprints]
    }
    else {
        conferences = pubs.filter( function (pub) {
            return (pub.type == "conference" && pub.year == year)
        });
        journals = pubs.filter( function (pub) {
            return (pub.type == "journal" && pub.year == year)
        });
        preprints = pubs.filter( function (pub) {
            return (pub.type == "preprint" && pub.year == year)
        });
        return [conferences, journals, preprints]
    }
};

module.exports = {
    oninit: function() {
        if (!Publication.loaded) Publication.loadList()
    },
    title: '',
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
        )

        var dddiv = m('div', {class: 'f6 dib ml4 mb4'}, [m('span', {class: 'f6 f5-ns pr2'}, 'Select year :'), dropdown])
        
        var chosenYear = options.filter( (item) => (parseInt(item.value) == Publication.selectedYearValue))[0].name;

        var papers = getPubs(Publication.list, chosenYear);
        var conferences = papers[0];
        var journals = papers[1];
        var preprints = papers[2];

        var conftitle = m('h3', {class: 'f6 ttu tracked nt2 green'}, 'CONFERENCE PROCEEDINGS');
        var conflist = m('ul', { class: 'fa-ul f6 f5-ns' }, conferences.map(CView));
        var confdiv = m('div', {id: 'conference', class: 'pa3 ph5-ns w-100' }, [conftitle, conflist]);

        var journaltitle = m('h3', {class: 'f6 ttu tracked nt2 light-red'}, 'PEER-REVIEWED JOURNAL ARTICLES');
        var journallist = m('ul', { class: 'fa-ul f6 f5-ns' }, journals.map(JView));
        var journaldiv = m('div', {id: 'journal', class: 'pa3 ph5-ns w-100' }, [journaltitle, journallist]);

        var preprinttitle = m('h3', {class: 'f6 ttu tracked nt2 blue'}, 'PREPRINTS');
        var preprintlist = m('ul', {class: 'fa-ul f6 f5-ns' }, preprints.map(PreprintView))
        var preprintdiv = m('div', {id: 'preprint', class: 'pa3 ph5-ns w-100' }, [preprinttitle, preprintlist])

        var paperdiv = []
        if (preprints.length != 0) 
            paperdiv.push(preprintdiv)
        if (journals.length != 0)
            paperdiv.push(journaldiv)
        if (conferences.length != 0)
            paperdiv.push(confdiv)
        
        return m('div', {class: 'pb3'}, [dddiv, paperdiv])
    }
}