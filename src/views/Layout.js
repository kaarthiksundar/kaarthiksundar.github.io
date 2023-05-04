var m = require("mithril");
var Header = require("./Header");
var Footer = require("./Footer");
var Content = require("./Content");

// For further details about this design, 
// especially the use of "vnode", check
// the "Wrapping a layout component" section in the following link:
// https://mithril.js.org/route.html#advanced-component-resolution

var view = function (vnode) {
    // m(component) consumes the component to generate a view.
    var content = m(Content, vnode.children)

    var body = m('div',
        { class: 'bg-white black-70' },
        [content]);

    return m('div',
        { class: 'firasans' },
        [m(Header), body, m(Footer)]
        );
};

module.exports = {
    view: view
};