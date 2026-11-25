var m = require("mithril")

module.exports = {
    view: function() {
        return m('footer',
            { class: 'site-footer tc pa2 f7' },
            [
            'Built with ',
            m('a', { href: 'http://tachyons.io/' }, 'Tachyons'),
            ' & ',
            m('a', { href: 'https://mithril.js.org/' }, 'MithrilJS'),
            '. © Kaarthik Sundar'
            ]
        )
    }
}
