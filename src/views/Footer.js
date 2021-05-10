var m = require("mithril")

module.exports = {
    view: function() {
        return m('footer',
            { class: 'fixed tc left-0 bottom-0 right-0 bg-light-gray gray pa2 f7' },
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