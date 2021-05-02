var m = require("mithril")
var Education = require("../models/Education")

var educationView = function (ed) {
    var icon = m('span', { class: 'fa-li' },
        m('i', { class: 'fas fa-graduation-cap' }))

    var children = [
        icon,
        m('span', {class: 'b black'}, ed.degree), ' in ', ed.department, ', ', ed.year,
        m('br'), ed.university]

    return m('li', { class: 'pa2 lh-copy'}, children)
}

module.exports = {
    oninit: function() {
        if (!Education.loaded) Education.loadList()
    },
    title: '',
    view: function () {
        return m('ul', { class: 'fa-ul f6 f5-ns nt3 pb3' }, Education.list.map(educationView))
    }
}