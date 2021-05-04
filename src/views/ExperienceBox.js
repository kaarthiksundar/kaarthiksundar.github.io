var m = require("mithril")
var Experience = require("../models/Experience")


var experienceView = function (ex) {
    var icon = m('span', { class: 'fa-li' },
        m('i', { class: 'fas fa-briefcase' }))
    
        var children = [
        icon, 
        m('span', {class: 'f6 tracked ttu black b'}, ex.role),
        m('br'),
        m('span', {class: 'b black-80'}, ex.group), 
        m('br'), m('span', {class: 'black-60'}, ex.organization),
        m('br'), ex.location,
        m('br'),
        ex.start, ' - ', ex.end]
    return m('li', { class: 'f6 f5-ns pa2 lh-copy'}, children)
}

module.exports = {
    oninit: function() {
        if (!Experience.loaded) Experience.loadList()
    },
    title: '',
    padding: '1',
    view: function () {
        return m('ul', {class: 'fa-ul f6 f5-ns nt3 pb3'}, 
            Experience.list.map(experienceView));
    }
}