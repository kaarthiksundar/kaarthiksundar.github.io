var m = require("mithril")
var Experience = require("../models/Experience")


var experienceView = function (ex) {
    var icon = m('span', { class: 'fa-li' },
        m('i', { class: 'fas fa-briefcase' }))
    
        var children = [
        icon, 
        m('span', {class: 'b black'}, ex.role),
        m('br'),
        m('i', ex.group), m('br'), ex.organization,
        m('br'), ex.location,
        m('br'),
        ex.start, ' - ', ex.end]
    return m('li', { class: 'pa2 lh-copy'}, children)
}

module.exports = {
    oninit: function() {
        if (!Experience.loaded) Experience.loadList()
    },
    title: 'Work Experience',
    padding: '1',
    view: function () {
        return m('ul', {class: 'fa-ul f6 f5-ns pb3'}, 
            Experience.list.map(experienceView));
    }
}