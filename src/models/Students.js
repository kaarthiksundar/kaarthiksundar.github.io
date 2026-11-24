var m = require("mithril")

var Group = {
    postdocs: [],
    students: [],
    committees: [],
    loaded: false,
    loadLists: async function () {
        console.log("Group.loadLists starting...")
        var results = await Promise.all([
            m.request({method: "GET", url: "../assets/postdocs.json"}),
            m.request({method: "GET", url: "../assets/students.json"}),
            m.request({method: "GET", url: "../assets/doctoral-committee.json"})
        ])
        Group.postdocs = results[0]
        Group.students = results[1]
        Group.committees = results[2]
        Group.loaded = true
        console.log("Group.loadLists completed.")
    }
}

module.exports = Group
