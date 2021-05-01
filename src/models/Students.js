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
    }
}

module.exports = Student