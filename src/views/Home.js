var m = require("mithril")
var Bio = require("../models/Bio")

module.exports = {
    view: function () {
        var img = m('img', {
            src: Bio.pic, 
            class: 'br-100 shadow-2 o-80 h5-ns w5-ns h4 w4 dib ba b--transparent', 
            title: 'Kaarthik Sundar'
        });

        var title = m('h2', {class: 'f3-ns f4 mb2'}, 'Scientist')
        
        var lanl = m('a', {
            href: 'https://www.lanl.gov/', 
            class: 'link dim gray hover-blue', 
            target: "_blank", rel: "noopener noreferrer"
        }, 'Los Alamos National Laboratory')

        var subTitle = m('h2', {class: 'f5-ns f6 fw4 gray mt0'}, [
            'Information Systems & Modeling', m('br'), m('br'), lanl])

        var pic = m('div', {class: 'tc'}, [img, title, m('br'), subTitle]);

        var scholar = m('a', {
            href: Bio.scholar, 
            target: "_blank", 
            rel: "noopener noreferrer" 
            },
            m('i', {
                class: 'ai ai-google-scholar ai-2x black-70 hover-blue'
            })
        );

        var github = m('a', {
            href: Bio.github, 
            target: "_blank", 
            rel: "noopener noreferrer"
            },
            m('i', {class: 'fab fa-github fa-2x black-70 hover-blue'})
        );

        var cv = m('a', {
            href: Bio.cv, 
            target: "_blank", 
            rel: "noopener noreferrer"
            },
            m('i', {class: 'ai ai-cv ai-2x black-70 hover-blue'})
        );

        var email = m('a', {
            href: Bio.email, 
            target: "_blank", 
            rel: "noopener noreferrer"
            },
            m('i', {class: 'fa fa-envelope fa-2x black-70 hover-blue'})
        );


        var icons = m('div', {class: 'tc'}, [ m('br'),
            m('span', {class: 'pr3'}, email),
            m('span', {class: 'pr3'}, github),
            m('span', {class: 'pr3'}, cv),
            m('span', {class: 'pr3'}, scholar), 
        ]);

        var card = m('article', {class: 'fl-ns w-50-ns mw6 right bg-white br3 pa2 mv3'}, 
            [pic, icons]
        );

        var desc = m('p', {class: 'fl-ns w-50-ns f6 f5-ns lh-copy pa4 tl'}, [
            Bio.biography, m('br'), m('br'), 
            Bio.research, m('br'), m('br'), 
            Bio.softwares
        ]);


        return m('div', {class: 'cf-ns nl2 nr2 nt5-ns'}, [card, desc])


        var scholar = m('a', {href: Bio.scholar, target: "_blank", rel: "noopener noreferrer"},
            m('i', {class: 'ai ai-google-scholar ai-2x black-70 hover-dark-red'})
        );
        var github = m('a', {href: Bio.github, target: "_blank", rel: "noopener noreferrer"},
            m('i', {class: 'fab fa-github fa-2x black-70 hover-dark-red'})
        );
        var img = m('img', {src: Bio.pic, class: 'br-100 shadow-2 o-80 h5-ns w5-ns h4 w4 dib', title: 'Kaarthik Sundar'});
        var img_new = m('img', {src: Bio.pic, class: 'br-100 shadow-2 h5-ns w5-ns h4 w4 dib ba b--transparent', title: 'Kaarthik Sundar'})
        var title = m('h1', {class: 'f3 mb2'}, 'Kaarthik')
        var subtitle = m('h2', {class: 'f5 fw4 gray mt0'}, 'LANL')
        var pic_new = m('div', {class: 'tc'}, [img, title, subtitle]);
        var pic = m('div', {class: 'tc'}, [img]);
        var email = m('p', {class: 'lh-title measure center f6 black-70'}, 
            ['E-mail id: ', m('a', {href: 'mailto:kaarthik@lanl.gov', class: 'link dim gray hover-dark-blue'}, 
            Bio.email), m('br'), m('br'), m('a', {href: Bio.cv, class: 'link dim gray hover-dark-blue', target: "_blank", rel: "noopener noreferrer"}, 
            'Download Curriculum Vitae')]
        );
        var caption = m('div', {class: 'tc'}, [email, m('br'), m('span', {class: 'pr3'}, scholar), github]);
        var card = m('article', {class: 'fl-ns w-50-ns mw6 center bg-white br3 pa2 pa3-ns mv3 w-50-ns'}, 
            [pic, caption]
        );
        var desc = m('p', {class: 'measure-wide fl-ns w-50-ns f6 f5-ns lh-copy pa4 tl'}, 
            [Bio.description, m('br'), m('br'), Bio.softwares]
        );
        // return m('div', {class: 'cf-ns nl2 nr2 nt5-ns'}, [card, desc])
        return img_new
    }
}