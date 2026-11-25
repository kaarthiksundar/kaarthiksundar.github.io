var m = require('mithril')
var Group = require('../models/Students')

const userIcon = (cssClass) => `<svg class="${cssClass}" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`

const Icon = {
    view: function (vnode) {
        return m.trust(userIcon(vnode.attrs.class || ''))
    }
}

var researcherView = function (colorClass, showUndergraduateMark) {
    return function (researcher) {
        var icon = m('span', {class: 'left--2 absolute w2 tc'}, m(Icon, {class: colorClass}))
        var undergraduateMark = showUndergraduateMark && researcher.undergraduate
            ? m('sup', {class: 'f7'}, '†')
            : null
        return m('li', {class: 'pa2 lh-copy'}, [
            icon,
            m('span', {class: 'black b'}, [researcher.name, undergraduateMark]), ', ', researcher.period,
            m('br'), researcher.research
        ])
    }
}

var committeeView = function (entry) {
    var icon = m('span', {class: 'left--2 absolute w2 tc'}, m(Icon, {class: 'dark-blue'}))
    return m('li', {class: 'pa2 lh-copy'}, [
        icon,
        m('span', {class: 'black b'}, entry.name), ', ', entry.university,
        m('br'), m('span', {class: 'i'}, entry.thesis)
    ])
}

var sectionLink = function (label, target, colorClass) {
    return m('a', {
        href: '#' + target,
        class: 'dib ba br2 ph2 pv1 mr2 mb2 bg-transparent link dim ' + colorClass
    }, label)
}

module.exports = {
    oninit: function () {
        if (!Group.loaded) Group.loadLists()
    },
    view: function () {
        var intro = m('p', {class: 'site-copy lh-copy'},
            'Mentoring is an integral part of Kaarthik\'s research. At LANL, he has worked with postdoctoral researchers and student interns on problems spanning optimization, energy systems, transportation, and autonomous systems.')

        var sectionLinks = m('nav', {
            class: 'mt3 mb4 f6',
            'aria-label': 'Group sections'
        }, m('ul', {class: 'list pa0 ma0'}, [
            m('li', {class: 'dib'}, sectionLink('Postdoctoral Researchers', 'postdoctoral-researchers', 'dark-green')),
            m('li', {class: 'dib'}, sectionLink('Student Interns', 'student-interns', 'dark-red')),
            m('li', {class: 'dib'}, sectionLink('Doctoral Committees', 'doctoral-committee', 'dark-blue'))
        ]))

        var postdocs = m('section', {id: 'postdoctoral-researchers', class: 'group-section pt3'}, [
            m('h2', {class: 'f6 ttu tracked green'}, 'Postdoctoral Researchers'),
            m('ul', {class: 'site-copy list pl0 ml4 relative'}, Group.postdocs.map(researcherView('green', false)))
        ])

        var students = m('section', {id: 'student-interns', class: 'group-section pt3'}, [
            m('h2', {class: 'f6 ttu tracked light-red'}, 'Student Interns'),
            m('p', {class: 'f7 f6-ns black-60'}, [m('sup', {class: 'f7'}, '†'), ' Undergraduate researcher']),
            m('ul', {class: 'site-copy list pl0 ml4 relative'}, Group.students.map(researcherView('light-red', true)))
        ])

        var committees = m('section', {id: 'doctoral-committee', class: 'group-section pt3'}, [
            m('h2', {class: 'f6 ttu tracked dark-blue'}, 'Doctoral Committees'),
            m('ul', {class: 'site-copy list pl0 ml4 relative'}, Group.committees.map(committeeView))
        ])

        return m('div', {class: 'pb3 nt3 nt6-ns pa3 ph5-ns'}, [
            intro,
            sectionLinks,
            postdocs,
            students,
            committees
        ])
    }
}
