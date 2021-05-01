var m = require('mithril')

class Link {
    constructor(name, route) {
        this.name = name;
        this.route = route;
    }
}

module.exports = {
    view: function (vnode) {

        var links = [
            new Link('Research', '/#!/research'),
            new Link('Education', '/#!/education'),
            new Link('Experience', '/#!/experience'),
            new Link('Publications', '/#!/publications'),
            new Link('Students', '/#!/students')
        ];

        var items = links.map( function(item) {
            return m('a', {href: item.route, 
                class: 'pv1-ns f6 fw6 dim link black-70 mr3 mr3-m mr4-l dib'},
                item.name)
        });

        var nav = m('div', {class: 'nowrap mw6 left'}, items);

        return m('div', 
            {class: 'ph3 ph5-ns w-100 bg-transparent pv3 mb3 mb5-ns bt bb b--black-10 overflow-auto'}, nav
        ); 
    }
}