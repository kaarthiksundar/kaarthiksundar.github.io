var m = require("mithril")
var Bio = require("../models/Bio")
var Education = require("../models/Education")

var educationView = function (ed) {
    var icon = m('span', { class: 'fa-li' },
        m('i', { class: 'fas fa-graduation-cap' }))

    var children = [
        icon,
        m('span', {class: 'black'}, ed.degree), ' in ', ed.department, ', ', ed.year,
        m('br'), m('div', {class: 'gray f7 f6-ns'}, ed.university)]

    return m('li', { class: 'pa1 f6 f5-ns lh-copy'}, children)
}

module.exports = {
    oninit: function() {
        if (!Education.loaded) Education.loadList()
    },
    view: function () {
        var img = m('img', {
            src: Bio.pic, 
            class: 'br-100 shadow-2 o-90 h5-ns w5-ns h4 w4 dib ba b--transparent', 
            title: 'Kaarthik Sundar'
        });

        var title = m('h2', {class: 'f3-ns f4 mb3'}, 'Staff Scientist')
        
        var lanl = m('a', {
            href: 'https://www.lanl.gov/', 
            class: 'link gray hover-blue', 
            target: "_blank", rel: "noopener noreferrer"
        }, 'Los Alamos National Laboratory')

        var group = m('a', {
            href: 'https://organizations.lanl.gov/a-1/',
            class: 'link gray hover-blue', 
            target: "_blank", rel: "noopener noreferrer"
        }, 'Information Systems and Modeling')

        var subTitle = m('h2', {class: 'f5-ns f6 fw4 gray mt1'}, [
            group, m('br'), m('br'), lanl])

        var pic = m('div', {class: 'tc'}, [img, title, subTitle]);

        var scholar = m('a', {
            href: Bio.scholar, 
            target: "_blank", 
            rel: "noopener noreferrer" 
            },
            m('i', {
                class: 'ai ai-google-scholar ai-2x black-70 hover-blue grow'
            })
        );

        var github = m('a', {
            href: Bio.github, 
            target: "_blank", 
            rel: "noopener noreferrer"
            },
            m('i', {class: 'fab fa-github fa-2x black-70 hover-blue grow'})
        );

        var cv = m('a', {
            href: Bio.cv, 
            target: "_blank", 
            rel: "noopener noreferrer"
            },
            m('i', {class: 'ai ai-cv ai-2x black-70 hover-blue grow'})
        );

        var email = m('a', {
            href: Bio.email, 
            target: "_blank", 
            rel: "noopener noreferrer"
            },
            m('i', {class: 'fa fa-envelope fa-2x black-70 hover-blue grow'})
        );

        var linkedin = m('a', {
            href: Bio.linkedin, 
            target: "_blank", 
            rel: "noopener noreferrer"
            },
            m('i', {class: 'fab fa-linkedin-in fa-2x black-70 hover-blue grow'})
        );


        var icons = m('div', {class: 'tc'}, [ m('br'),
            m('span', {class: 'pr3'}, email),
            m('span', {class: 'pr3'}, github),
            m('span', {class: 'pr3'}, cv),
            m('span', {class: 'pr3'}, scholar), 
            m('span', {class: 'pr3'}, linkedin), 
        ]);

        var card = m('article', {class: 'fl-ns w-50-ns mw6 right bg-white br3 pa2 mv3'}, 
            [pic, icons]
        );


        var education = m('ul', { class: 'fa-ul f6 f5-ns' }, Education.list.map(educationView))
        var edTitle = m('h4', {class: 'f5-ns f6 ttu tracked mb2 black'}, 'EDUCATION')
        var edRow = m('div', {class: 'dt-row'}, [edTitle, education])
        
        var desc = m('p', {class: 'measure-wide fl-ns w-50-ns f6 f5-ns lh-copy pa2 tl'}, [
            Bio.biography, ' ', 
            Bio.research, //' ', 
            // Bio.softwares,
            edRow
        ]);

        var home = m('div', {class: 'cf-ns nl2 nr2 nt6-ns'}, [card, desc])

        return home
    }
}