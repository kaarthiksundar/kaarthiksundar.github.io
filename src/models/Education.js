var m = require("mithril")

var Education = {
    list: [],
    loaded: false,
    loadList: async function () {
        console.log("Education.loadList starting...")
        const result = await m.request({
            method: "GET",
            url: "../assets/education.json",
        })
        Education.list = result
        Education.loaded = true
        console.log("Education.loadList completed.")
    }
}

module.exports = Education