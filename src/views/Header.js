var m = require("mithril")

module.exports = {
    view: function (vnode) {
        var logo = m('div', {class: 'db dtc-ns v-mid tl w-100'},
            m('a', {href: '/', class: 'dib f5 f4-ns fw6 mt0 mb0 link dim white'},
                'KAARTHIK SUNDAR\'S HOMEPAGE'
            )
        );

        return m('div', {class: 'w-100 pa3 ph5-ns bg-dark-gray'}, 
            m('div', {class: 'db dt-ns mw9 center w-100'}, logo)
        );
    }
}