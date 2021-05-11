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
            new Link('Home', '/#!'),
            new Link('Research', '/#!/research'),
            new Link('Education', '/#!/education'),
            new Link('Experience', '/#!/experience'),
            new Link('Publications', '/#!/publications'),
            new Link('Students', '/#!/students')
        ];

        var items = links.map( function(item) {
            return m('a', {href: item.route, 
                class: 'pv1-ns f6 fw6 dim link navy mr3 mr3-m mr4-l dib'},
                item.name)
        });
        
        var nav = m('div', {class: 'nowrap left'}, items);
        
        return m('nav', 
            {class: 'ph3 ph5-ns w-100 bg-white pv3 mb3 mb5-ns bt bb b--black-10 overflow-auto'}, 
            nav
        ); 
    }
}