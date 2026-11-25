var m = require('mithril')
var Bio = require('../models/Bio')

const icons = {
    'github': (cssClass) => `<svg class="${cssClass}" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>`,
    'email': (cssClass) => `<svg class="${cssClass}" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>`,
}
  
const Icon = {
    view: (v) => {
        if (v.attrs.name in icons) {
            let cssClass = v.attrs.class || ''
            return m.trust(icons[v.attrs.name](cssClass))
        }
        return ''
    }
}

var researchAreaView = function (area) {
    return m('div', {class: 'w-100 w-50-m w-25-l pa2'},
        m('article', {class: 'research-interest-card h-100 ba br2 pa3'}, [
            m('h3', {class: 'research-interest-title f5 mt0 mb2'}, area.title),
            m('p', {class: 'site-copy lh-copy mv0 dark-gray'}, area.description)
        ])
    )
}

module.exports = {
    view: function () {
        var img = m('img', {
            src: Bio.pic, 
            class: 'br-100 shadow-2 o-90 h5-ns w5-ns h4 w4 dib ba b--transparent', 
            alt: 'Portrait of Kaarthik Sundar'
        });

        var title = m('h2', {class: 'f3-ns f4 mb3 black'}, 'Staff Scientist III')
        
        var lanl = m('a', {
            href: 'https://www.lanl.gov/', 
            class: 'link dark-gray hover-blue', 
            target: '_blank', rel: 'noopener noreferrer'
        }, 'Los Alamos National Laboratory')

        var group = m('span', {class: 'dark-gray'}, 'Computational Intelligence & Modeling')

        var subTitle = m('h2', {class: 'f5-ns f6 fw4 dark-gray mt1'}, [
            group, m('br'), m('br'), lanl])

        var pic = m('div', {class: 'tc'}, [img, title, subTitle]);

        var scholar = m('a', {
            href: Bio.scholar, 
            target: '_blank', 
            rel: 'noopener noreferrer',
            title: 'Google Scholar' 
            },
            m('i', {
                class: 'ai ai-google-scholar ai-2x black-70 hover-blue grow'
            })
        );

        var github = m('a', {
            href: Bio.github, 
            target: '_blank', 
            rel: 'noopener noreferrer',
            title: 'GitHub', 
            class: 'no-underline'
            },
            m(Icon, {name: 'github', class: 'black-70 hover-blue grow'})
        );

        var email = m('a', {
            href: Bio.email, 
            target: '_blank', 
            rel: 'noopener noreferrer',
            title: 'email',
            class: 'no-underline'
            },
            m(Icon, {name: 'email', class: 'black-70 hover-blue grow'})
        );

        var icons = m('div', {class: 'tc'}, [ m('br'),
            m('span', {class: 'pr3'}, email),
            m('span', {class: 'pr3'}, github),
            m('span', {class: 'pr3'}, scholar),
        ]);

        var card = m('article', {class: 'w-50-ns w-100-m mw6 bg-white br3 pa2 mv3'}, 
            [pic, icons]
        );


        var desc = m('div', {class: 'site-copy measure-wide w-50-ns w-100-m lh-copy pa2 tl'}, [
            m('p', Bio.biography),
            m('p', Bio.research)
        ]);

        var home = m('div', {class: 'flex flex-column flex-row-l cf-ns nl2 nr2 nt6-ns justify-center items-center-m'}, [card, desc])

        var researchAreas = m('section', {class: 'mw8 center mt4 mb4'}, [
            m('h2', {class: 'f4 f3-ns mb2 black'}, 'Research Interests'),
            m('div', {class: 'flex flex-wrap nl2 nr2'}, Bio.researchAreas.map(researchAreaView))
        ])

        return m('div', [home, researchAreas])
    }
}
