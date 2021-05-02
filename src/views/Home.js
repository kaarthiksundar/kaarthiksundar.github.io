var m = require("mithril")
var Bio = require("../models/Bio")

module.exports = {
    title: '',
    view: function () {
        var scholar = m('a', {href: Bio.scholar},
            m('i', {class: 'ai ai-google-scholar ai-2x dark-blue'})
        );
        var github = m('a', {href: Bio.github},
            m('i', {class: 'fab fa-github fa-2x dark-blue'})
        );
        var img = m('img', {src: Bio.pic, class: 'br4 ba h5-ns w5-ns h4 w4 dib', title: 'Kaarthik Sundar'});
        var pic = m('div', {class: 'tc'}, [img]);
        var email = m('p', {class: 'lh-title measure center f6 black-70'}, 
            ['E-mail id: ', m('a', {href: 'mailto:kaarthik@lanl.gov', class: 'link dim black'}, 
            Bio.email), m('br'), m('br'), m('a', {href: Bio.cv, class: 'link dim black hover-blue'}, 
            'Download Curriculum Vitae')]
        );
        var caption = m('div', {class: 'tc'}, [email, m('br'), m('span', {class: 'pr3'}, scholar), github]);
        var card = m('article', {class: 'fl-ns w-50-ns mw6 center bg-white br3 pa2 pa3-ns mv3 w-50-ns'}, 
            [pic, caption]
        );
        var desc = m('p', {class: 'measure-wide fl-ns w-50-ns f6 f5-ns lh-copy pa4 tl'}, 
            [Bio.description, m('br'), m('br'), Bio.softwares]
        );
        return m('div', {class: 'cf-ns nl2 nr2'}, [card, desc])
    }
}