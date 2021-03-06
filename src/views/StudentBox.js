var m = require('mithril');
var Student = require('../models/Students');

var SummerStudentView = function (student) {
    var icon = m('span', { class: 'fa-li' },
        m('i', { class: 'fas fa-user-graduate light-red'}));

    var children = [
        icon, m('span', {class: 'black'}, student.name), ', ', 
        student.start, m('br'), '   ', student.research
    ]
    
    return m('li', { class: 'pa2 lh-copy'}, children)
};

var PostdocView = function (student) {
    var icon = m('span', { class: 'fa-li' },
        m('i', { class: 'fas fa-user-graduate green'}));

    var children = [
        icon, m('span', {class: 'black'}, student.name), ', ', 
        student.start, ' -- ', student.end, 
        m('br'), '   ', student.research
    ]
    
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
    
        var desc = m('div', {class: 'lh-copy f6 f5-ns pa3 ph5-ns'}, 'At LANL, Kaarthik has had the pleasure of mentoring an excellent set of Graduate Student Interns and Post-doctoral Researchers whose list is given below:')

        var pdtitle = m('h3', {class: 'f6 ttu tracked nt2 green'}, 'POST-DOCTORAL RESEARCHERS');
        var pdlist = m('ul', { class: 'fa-ul f6 f5-ns' }, pd.map(PostdocView));
        var pddiv = m('div', {id: 'pd', class: 'pa3 ph5-ns w-100' }, [pdtitle, pdlist]);

        var summertitle = m('h3', {class: 'f6 ttu tracked nt2 light-red'}, 'GRADUATE STUDENT INTERNS');
        var summerlist = m('ul', { class: 'fa-ul f6 f5-ns' }, summer.map(SummerStudentView));
        var summerdiv = m('div', {id: 'journal', class: 'pa3 ph5-ns w-100' }, [summertitle, summerlist]);
        
        return m('div', {class: 'pb3 nt3 nt6-ns'}, [desc, pddiv, summerdiv])
    }
}