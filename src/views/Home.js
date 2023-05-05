var m = require('mithril')
var Bio = require('../models/Bio')
var Education = require('../models/Education')

const icons = {
    'linkedin': (cssClass) => `<svg class="${cssClass}" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>`,
    'github': (cssClass) => `<svg class="${cssClass}" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>`,
    'email': (cssClass) => `<svg class="${cssClass}" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>`,
    'grad': (cssClass) => `<svg class="${cssClass}" xmlns="http://www.w3.org/2000/svg" width="16px" height="16px" viewBox="0 0 16 16"><path style=" stroke:none;fill-rule:nonzero;fill:currentColor;fill-opacity:1;" d="M 16 5.652344 L 16 13.332031 C 16 13.703125 15.703125 14 15.332031 14 C 14.964844 14 14.667969 13.703125 14.667969 13.332031 L 14.667969 7.835938 L 9.734375 10.191406 C 9.214844 10.5 8.621094 10.660156 8.015625 10.65625 C 7.382812 10.65625 6.761719 10.484375 6.214844 10.160156 L 1.296875 7.820312 C 0.507812 7.394531 0.0117188 6.578125 0 5.683594 C -0.0117188 4.789062 0.464844 3.960938 1.238281 3.515625 C 1.257812 3.507812 1.277344 3.496094 1.296875 3.488281 L 6.265625 1.113281 C 7.359375 0.488281 8.707031 0.5 9.789062 1.144531 L 14.703125 3.488281 C 15.496094 3.921875 15.988281 4.75 16 5.652344 Z M 8.015625 11.988281 C 7.160156 11.988281 6.324219 11.765625 5.585938 11.339844 L 2.667969 9.945312 L 2.667969 11.746094 C 2.667969 13.207031 3.617188 14.496094 5.011719 14.929688 C 5.984375 15.210938 6.988281 15.34375 8 15.332031 C 9.011719 15.34375 10.015625 15.207031 10.988281 14.929688 C 12.382812 14.496094 13.332031 13.203125 13.332031 11.742188 L 13.332031 9.949219 L 10.359375 11.371094 C 9.648438 11.777344 8.835938 11.992188 8.015625 11.988281 Z M 8.015625 11.988281 "/></svg>`,
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

var educationView = function (ed) {
    // 'fa-li' is replaced by 'left--2 absolute w2 tc' 
    var icon = m('span', { class: 'left--2 absolute w2 tc' },
        m(Icon, { name: 'grad'}))

    university = m('a', {
        href: ed.link, 
        class: 'link dark-gray hover-blue', 
        target: '_blank', rel: 'noopener noreferrer'
    }, ed.university)

    var children = [
        icon,
        m('span', {class: 'black'}, ed.degree), ' in ', ed.department, ', ', ed.year,
        m('br'), m('div', {class: 'dark-gray f7 f6-ns'}, university)]

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

        var title = m('h2', {class: 'f3-ns f4 mb3 black'}, 'Staff Scientist')
        
        var lanl = m('a', {
            href: 'https://www.lanl.gov/', 
            class: 'link dark-gray hover-blue', 
            target: '_blank', rel: 'noopener noreferrer'
        }, 'Los Alamos National Laboratory')

        var group = m('a', {
            href: 'https://organizations.lanl.gov/a-1/',
            class: 'link dark-gray hover-blue', 
            target: '_blank', rel: 'noopener noreferrer'
        }, 'Information Systems and Modeling')

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

        var cv = m('a', {
            href: Bio.cv, 
            target: '_blank', 
            rel: 'noopener noreferrer',
            title: 'Curriculum Vitae'
            },
            m('i', {class: 'ai ai-cv ai-2x black-70 hover-blue grow'})
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

        var linkedin = m('a', {
            href: Bio.linkedin, 
            target: '_blank', 
            rel: 'noopener noreferrer',
            title: 'LinkedIn',
            class: 'no-underline' 
            },
            m(Icon, {name: 'linkedin', class: 'black-70 hover-blue grow'})
        );
{/* <ion-icon name="logo-linkedin"></ion-icon> */}

        var icons = m('div', {class: 'tc'}, [ m('br'),
            m('span', {class: 'pr3'}, email),
            m('span', {class: 'pr3'}, github),
            m('span', {class: 'pr3'}, cv),
            m('span', {class: 'pr3'}, scholar), 
            m('span', {class: 'pr3'}, linkedin), 
        ]);

        var card = m('article', {class: 'w-50-ns w-100-m mw6 bg-white br3 pa2 mv3'}, 
            [pic, icons]
        );


        var education = m('ul', { class: 'list pl0 ml4 relative f6 f5-ns' }, Education.list.map(educationView))
        var edTitle = m('h4', {class: 'f5-ns f6 ttu tracked mb2 black'}, 'EDUCATION')
        var edRow = m('div', {class: 'dt-row'}, [edTitle, education])
        
        var desc = m('p', {class: 'measure-wide w-50-ns w-100-m f6 f5-ns lh-copy pa2 tl'}, [
            Bio.biography, ' ', 
            Bio.research, //' ', 
            // Bio.softwares,
            edRow
        ]);

        var home = m('div', {class: 'flex flex-column flex-row-l cf-ns nl2 nr2 nt6-ns justify-center items-center-m'}, [card, desc])

        return home
    }
}