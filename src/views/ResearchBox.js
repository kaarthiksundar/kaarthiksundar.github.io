var m = require("mithril")
var Bio = require("../models/Bio")

module.exports = {
    title: '',
    view: function () {
        var theoryTitle = m('h3', {class: 'f6 ttu tracked nt2'}, 'THEORY');
        var appliedTitle = m('h3', {class: 'f6 ttu tracked nt2'}, 'APPLICATION DOMAINS');

        var theoryItems = Bio.theoryInterests.map(function(item) {
            return m('li', {class: 'pa1 lh-copy'}, item)
        });
        var theorylist = m('ul', {class: 'f6 f5-ns' }, theoryItems);
        var theorydiv = m('div', {id: 'theory', class: 'fl-l pa2 ph5-l w-50-l center' }, [theoryTitle, theorylist]);

        var appliedItems = Bio.appliedInterests.map(function(item) {
            return m('li', {class: 'pa1 lh-copy'}, item)
        });
        var appliedlist = m('ul', { class: 'f6 f5-ns' }, appliedItems);
        var applieddiv = m('div', {id: 'theory', class: 'fl-l pa2 ph5-l w-50-l center' }, [appliedTitle, appliedlist]);

        return m('div', {class: 'nt3 cf-ns nl2 nr2'}, [theorydiv, applieddiv]);
    }
}