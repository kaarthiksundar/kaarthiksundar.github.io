var m = require("mithril")
var Experience = require("../models/Experience")


var experienceView = function (ex) {
    var icon = m('span', { class: 'fa-li' },
        m('i', { class: 'fas fa-briefcase' }))
    
        var children = [
        icon, 
        m('span', {class: 'f6 f5-ns ttu black b'}, ex.role),
        m('br'),
        m('span', {class: 'black-90'}, ex.group), 
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
    view: function () {
        return m('ul', {class: 'fa-ul f6 f5-ns pb3 nt6-ns nt2 pl4'}, 
            Experience.list.map(experienceView));
    }
}