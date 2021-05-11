var m = require("mithril")

var Student = {
    list: [],
    loaded: false,
    loadList: async function () {
        console.log("Students.loadList starting...")
        Student.list = await m.request({
            method: "GET",
            url: "../assets/students.json",
        })
        Student.loaded = true
        console.log("Students.loadList completed.")
    },
    getStudents: function() {
        summer = Student.list.filter( function (it) {
            return (it.type == "summer")
        });
    
        pd = Student.list.filter( function (it) {
            return (it.type == "postdoc")
        });
    
        summer.sort((a, b) => (a.start > b.start) ? -1 : 1)
        pd.sort((a, b) => (a.start > b.start) ? -1 : 1)
        
        return [summer, pd]
    }
}

module.exports = Student