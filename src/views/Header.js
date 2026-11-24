var m = require("mithril")
var Navmenu = require("./Navmenu")
var Theme = require("../models/Theme")

var moonIcon = '<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>'
var sunIcon = '<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"></circle><line x1="12" y1="2" x2="12" y2="4"></line><line x1="12" y1="20" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="6.34" y2="6.34"></line><line x1="17.66" y1="17.66" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="4" y2="12"></line><line x1="20" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="6.34" y2="17.66"></line><line x1="17.66" y1="6.34" x2="19.07" y2="4.93"></line></svg>'

module.exports = {
    view: function() {
        var logo = m('div', {class: 'db v-mid tl'},
            m(m.route.Link, {href: '/', class: 'f5 f4-ns fw6 link dim white'},
                'KAARTHIK SUNDAR'
            )
        );

        var isDark = Theme.current() == 'dark'
        var themeToggle = m('button', {
            type: 'button',
            class: 'theme-toggle pointer br2 pa1 flex items-center justify-center',
            onclick: Theme.toggle,
            'aria-label': isDark ? 'Switch to light mode' : 'Switch to dark mode',
            title: isDark ? 'Switch to light mode' : 'Switch to dark mode'
        }, m.trust(isDark ? sunIcon : moonIcon))

        var topbar = m('div', {class: 'site-header-bar pa3 ph5-ns flex items-center justify-between'}, [logo, themeToggle]);

        return m('header', {class: 'w-100 fixed z-3', id: 'header'}, 
            [topbar, m(Navmenu)])
    }
}
