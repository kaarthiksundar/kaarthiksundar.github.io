var m = require("mithril")
var Experience = require("../models/Experience")
var Education = require("../models/Education")

const icons = {
    'work': (cssClass) => `<svg class="${cssClass}" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>`,
    'grad': (cssClass) => `<svg class="${cssClass}" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><path fill="currentColor" d="M16 5.65v7.68a.67.67 0 0 1-1.33 0V7.84L9.73 10.2a3.45 3.45 0 0 1-3.52-.04L1.3 7.82A2.44 2.44 0 0 1 0 5.68a2.47 2.47 0 0 1 1.24-2.17l5.03-2.4a3.47 3.47 0 0 1 3.52.03l4.91 2.35A2.48 2.48 0 0 1 16 5.65ZM8.02 11.99a4.9 4.9 0 0 1-2.43-.65L2.67 9.95v1.8a3.34 3.34 0 0 0 2.34 3.18c.97.28 1.98.41 2.99.4 1.01.01 2.02-.12 2.99-.4a3.34 3.34 0 0 0 2.34-3.19V9.95l-2.97 1.42c-.71.41-1.52.62-2.34.62Z"/></svg>`
}

const Icon = {
    view: (v) => {
        if (v.attrs.name in icons) {
            return m.trust(icons[v.attrs.name](v.attrs.class || ''))
        }
        return ''
    }
}

var experienceView = function (entry) {
    var icon = m('span', {class: 'left--2 absolute w2 tc dark-blue'}, m(Icon, {name: 'work'}))
    return m('li', {class: 'pa2 lh-copy'}, [
        icon,
        m('span', {class: 'dark-blue b'}, entry.role),
        m('br'), entry.group,
        m('br'), m('span', {class: 'black-60'}, entry.organization),
        m('br'), entry.start, ' - ', entry.end
    ])
}

var educationView = function (entry) {
    var icon = m('span', {class: 'left--2 absolute w2 tc dark-green'}, m(Icon, {name: 'grad'}))
    var university = m('a', {
        href: entry.link,
        class: 'link dark-gray hover-blue',
        target: '_blank',
        rel: 'noopener noreferrer'
    }, entry.university)

    return m('li', {class: 'pa2 lh-copy'}, [
        icon,
        m('span', {class: 'dark-green fw6'}, [entry.degree, ' in ', entry.department]),
        m('br'), university, ', ', entry.year
    ])
}

module.exports = {
    oninit: function () {
        if (!Experience.loaded) Experience.loadList()
        if (!Education.loaded) Education.loadList()
    },
    view: function () {
        var sectionHeadingClass = 'experience-section-title ttu tracked black fw6'
        var appointments = m('ul', {class: 'site-copy experience-list list pl0 ml4 relative'}, Experience.list.map(experienceView))
        var education = m('ul', {class: 'site-copy experience-list list pl0 ml4 relative'}, Education.list.map(educationView))

        return m('div', {class: 'nt6-ns nt2 pa3 ph5-ns'}, [
            m('h2', {class: sectionHeadingClass + ' mt0'}, 'Research Appointments'),
            appointments,
            m('h2', {class: sectionHeadingClass + ' mt4'}, 'Education'),
            education
        ])
    }
}
