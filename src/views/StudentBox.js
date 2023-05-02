var m = require('mithril');
var Student = require('../models/Students');

const icons = {
    'user': (cssClass) => `<svg class="${cssClass}" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`
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

var SummerStudentView = function (student) {
    // 'fa-li' is replaced by 'left--2 absolute w2 tc' 
    var icon = m('span', { class: 'left--2 absolute w2 tc' },
        m(Icon, { name: 'user', class: 'light-red'}));

    var name; 
    if (student.linkedin) {
        name = m('a', {
            class: 'link black hover-blue',
            href: student.linkedin, 
            target: "_blank", 
            rel: "noopener noreferrer"
            }, student.name
        ) 
    }
    else name = student.name

    var children = [
        icon, m('span', {class: 'black'}, name), ', ', 
        student.start, m('br'), '   ', student.research, m('br')
    ]

    // if (student.linkedin != "") {
    //     children.push(m('a', {class: 'f7 link dim br2 ba ph1 mb2 dib light-red', 
    //         href: student.linkedin}, 'LinkedIn'));
    // }
    
    return m('li', { class: 'pa2 lh-copy'}, children)
};

var PostdocView = function (student) {
    // 'fa-li' is replaced by 'left--2 absolute w2 tc' 
    var icon = m('span', { class: 'left--2 absolute w2 tc' },
        m(Icon, { name: 'user', class: 'green'}));

    var name; 
    if (student.linkedin) {
        name = m('a', {
            class: 'link black hover-blue',
            href: student.linkedin, 
            target: "_blank", 
            rel: "noopener noreferrer"
            }, student.name
        ) 
    }
    else name = student.name

    var children = [
        icon, m('span', {class: 'black'}, name), ', ', 
        student.start, ' — ', student.end, 
        m('br'), '   ', student.research, m('br')
    ]

    // if (student.linkedin != "") {
    //     children.push(m('a', {class: 'f7 link dim br2 ba ph1 mb2 dib green', 
    //         href: student.linkedin}, 'LinkedIn'));
    // }
    
    return m('li', { class: 'pa2 lh-copy'}, children)
};


module.exports = {
    oninit: function() {
        if (!Student.loaded) Student.loadList()
    },
    view: function () {
        var students = Student.getStudents();
        var summer = students[0];
        var pd = students[1];
    
        var desc = m('div', {class: 'lh-copy f6 f5-ns pa3 ph5-ns'}, 'At LANL, Kaarthik has had the pleasure of mentoring an excellent set of graduate research assistants and post-doctoral researchers whose list is given below:')

        var pdtitle = m('h3', {class: 'f6 ttu tracked nt2 green'}, 'POST-DOCTORAL RESEARCHERS');
        // 'fa-ul' replaced by 'list pl0 ml4 relative'
        var pdlist = m('ul', { class: 'list pl0 ml4 relative f6 f5-ns' }, pd.map(PostdocView));
        var pddiv = m('div', {id: 'pd', class: 'pa3 ph5-ns w-100' }, [pdtitle, pdlist]);

        var summertitle = m('h3', {class: 'f6 ttu tracked nt2 light-red'}, 'GRADUATE RESEARCH ASSISTANTS');
        // 'fa-ul' replaced by 'list pl0 ml4 relative'
        var summerlist = m('ul', { class: 'list pl0 ml4 relative f6 f5-ns' }, summer.map(SummerStudentView));
        var summerdiv = m('div', {id: 'journal', class: 'pa3 ph5-ns w-100' }, [summertitle, summerlist]);
        
        return m('div', {class: 'pb3 nt3 nt6-ns'}, [desc, pddiv, summerdiv])
    }
}