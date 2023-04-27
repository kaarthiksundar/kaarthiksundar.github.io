var m = require("mithril")
var Experience = require("../models/Experience")

const icons = {
    'work': (cssClass) => `<svg class="${cssClass}" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>`
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


var experienceView = function (ex) {
        // 'fa-li' is replaced by 'left--2 absolute w2 tc' 
        var icon = m('span', { class: 'left--2 absolute w2 tc' },
            m(Icon, { name: 'work'}))
    
        var children = [
        icon, 
        m('span', {class: 'f6 ttu black b'}, ex.role),
        m('br'),
        m('span', {class: 'black-90'}, ex.group), 
        m('br'), m('span', {class: 'black-60'}, ex.organization),
        m('br'), ex.location,
        m('br'),
        ex.start, ' — ', ex.end]
    return m('li', { class: 'f6 f5-ns pa2 lh-copy'}, children)
}

module.exports = {
    oninit: function() {
        if (!Experience.loaded) Experience.loadList()
    },
    view: function () {
        // 'fa-ul' replaced by 'list pl0 ml2 relative'
        return m('ul', {class: 'list pl2 ml4 relative nt6-ns nt2'}, 
            Experience.list.map(experienceView));
    }
}