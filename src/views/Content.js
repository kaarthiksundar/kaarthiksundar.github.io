var m = require("mithril")

module.exports = {
    view: function (vnode) {
        return m('div', {class: 'pa3 ph5-ns w-100 pt6 pt7-ns', 
            id: 'content'},
            [vnode.children]);
    }
}