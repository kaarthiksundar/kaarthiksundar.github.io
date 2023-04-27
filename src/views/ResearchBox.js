var m = require("mithril")
var Bio = require("../models/Bio")

const icons = {
    'research': (cssClass) => `<svg class="${cssClass}" xmlns="http://www.w3.org/2000/svg" width="16px" height="16px" viewBox="0 0 16 16"><path style=" stroke:none;fill-rule:nonzero;fill:currentColor;fill-opacity:1;" d="M 10.667969 4 C 11.035156 4 11.332031 4.296875 11.332031 4.667969 C 11.332031 5.035156 11.035156 5.332031 10.667969 5.332031 L 5.332031 5.332031 C 4.964844 5.332031 4.667969 5.035156 4.667969 4.667969 C 4.667969 4.296875 4.964844 4 5.332031 4 Z M 15.804688 15.804688 C 15.542969 16.066406 15.121094 16.066406 14.863281 15.804688 L 13.257812 14.199219 C 12.78125 14.503906 12.230469 14.664062 11.667969 14.667969 C 10.011719 14.667969 8.667969 13.324219 8.667969 11.667969 C 8.667969 10.011719 10.011719 8.667969 11.667969 8.667969 C 13.324219 8.667969 14.667969 10.011719 14.667969 11.667969 C 14.664062 12.230469 14.503906 12.78125 14.199219 13.257812 L 15.804688 14.863281 C 16.066406 15.121094 16.066406 15.542969 15.804688 15.804688 Z M 11.667969 13.332031 C 12.585938 13.332031 13.332031 12.585938 13.332031 11.667969 C 13.332031 10.746094 12.585938 10 11.667969 10 C 10.746094 10 10 10.746094 10 11.667969 C 10 12.585938 10.746094 13.332031 11.667969 13.332031 Z M 8.667969 14.667969 L 4.667969 14.667969 C 3.5625 14.667969 2.667969 13.769531 2.667969 12.667969 L 2.667969 3.332031 C 2.667969 2.230469 3.5625 1.332031 4.667969 1.332031 L 12.667969 1.332031 C 13.035156 1.332031 13.332031 1.632812 13.332031 2 L 13.332031 7.332031 C 13.332031 7.703125 13.632812 8 14 8 C 14.367188 8 14.667969 7.703125 14.667969 7.332031 L 14.667969 2 C 14.667969 0.894531 13.769531 0 12.667969 0 L 4.667969 0 C 2.828125 0.00390625 1.335938 1.492188 1.332031 3.332031 L 1.332031 12.667969 C 1.335938 14.507812 2.828125 15.996094 4.667969 16 L 8.667969 16 C 9.035156 16 9.332031 15.703125 9.332031 15.332031 C 9.332031 14.964844 9.035156 14.667969 8.667969 14.667969 Z M 8.667969 14.667969 "/></svg>`
}

// 'fa-li' is replaced by 'left--2 absolute w2 tc' 
const Icon = {
    view: (v) => {
        if (v.attrs.name in icons) {
            let cssClass = v.attrs.class || ''
            return m.trust(icons[v.attrs.name](cssClass))
        }
        return ''
    }
}

module.exports = {
    view: function () {
        var icon = m('span', { class: 'left--2 absolute w2 tc' }, m(Icon, { name: 'research'}))

        var theoryTitle = m('h3', {class: 'f6 ttu tracked nt2 black'}, 'THEORY');
        var appliedTitle = m('h3', {class: 'f6 ttu tracked nt2 black'}, 'APPLICATION DOMAINS');


        var theoryItems = Bio.theoryInterests.map(function(item) {
            return m('li', {class: 'pa2 lh-copy'}, [icon, item])
        });
        var theorylist = m('ul', {class: 'list pl2 ml4 relative f6 f5-ns' }, theoryItems);
        var theorydiv = m('div', {id: 'theory', class: 'fl-l pa2 ph5-l w-50-l center' }, [theoryTitle, theorylist]);

        var appliedItems = Bio.appliedInterests.map(function(item) {
            return m('li', {class: 'pa2 lh-copy'}, [icon, item])
        });
        var appliedlist = m('ul', { class: 'list pl0 ml4 relative f6 f5-ns' }, appliedItems);
        var applieddiv = m('div', {id: 'theory', class: 'fl-l pa2 ph5-l w-50-l center' }, [appliedTitle, appliedlist]);

        return m('div', {class: 'nt3 cf-ns nl2 nr2 nt5-l nt6-m pt4 pl3 pl4-ns'}, [theorydiv, applieddiv]);
    }
}