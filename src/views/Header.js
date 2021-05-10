var m = require("mithril")
var Navmenu = require("./Navmenu")

module.exports = {
    view: function () {
        var logo = m('div', {class: 'db v-mid tl w-100'},
            m('a', {href: '/', class: 'f5 f4-ns fw6 link dim white'},
                'KAARTHIK SUNDAR\'S HOMEPAGE'
            )
        );

        var topbar = m('div', {class: 'w-100 pa3 ph5-ns bg-dark-gray'}, 
            logo
        );

        return m('header', {class: 'w-100 fixed z-3'}, [topbar, m(Navmenu)])
    }
}