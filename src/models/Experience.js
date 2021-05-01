var m = require("mithril")

var Experience = {
    list: [],
    loaded: false,
    loadList: async function () {
        console.log("Experience.loadList starting...")
        const result = await m.request({
            method: "GET",
            url: "../assets/experience.json",
        })
        Experience.list = result
        Experience.loaded = true
        console.log("Experience.loadList completed.")
    }
}

module.exports = Experience
