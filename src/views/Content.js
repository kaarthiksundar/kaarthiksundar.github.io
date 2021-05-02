var m = require("mithril")

module.exports = {
    view: function (vnode) {
        var title = m('h3',
            { class: 'f6 ttu tracked mt0' },
            vnode.attrs.title)
        
        if (vnode.attrs.title == '') {
            return m('div', {class: 'pa3 ph5-ns w-100', id: 'content'},
                    [vnode.children]);
        }
        
        return m('div', {class: 'pa3 ph5-ns w-100 relative', id: 'content'},
                [title, vnode.children]);
    }
}