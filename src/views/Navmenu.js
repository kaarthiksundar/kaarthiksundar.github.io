var m = require('mithril')

class Link {
    constructor(name, route) {
        this.name = name;
        this.route = route;
    }
};

module.exports = {
    view: function() {
        var links = [
            new Link('Home', '/'),
            new Link('Experience', '/experience'),
            new Link('Publications', '/publications'),
            new Link('Group', '/group')
        ];

        var items = links.map( function(item) {
            var currentPath = m.route.get().split(/[?#]/)[0]
            var isCurrent = currentPath == item.route
            return m(m.route.Link, {
                href: item.route,
                class: 'site-nav-link pv1-ns f6 fw6 dim link mr3 mr3-m mr4-l dib',
                'aria-current': isCurrent ? 'page' : null
            },
                item.name)
        });
        
        var nav = m('div', {class: 'nowrap left'}, items);
        
        return m('nav', 
            {class: 'site-nav ph3 ph5-ns w-100 pv3 mb3 mb5-ns bt bb overflow-auto'},
            nav
        ); 
    }
}
