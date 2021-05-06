var m = require("mithril")

var Publication = {
    list: [],
    loaded: false,
    loadList: async function () {
        console.log("Publication.loadList starting...")
        Publication.list = await m.request({
            method: "GET",
            url: "../assets/pubs.json",
        })
        // Publication.list = result
        Publication.loaded = true
        console.log("Publication.loadList completed.")
    },
    getYears: function () {
        return Array.from(new Set(Publication.list.map( function(o) {
            return o['year'];
        }).sort()));
    }, 
    selectedYearValue: 1,
    searchString: ''
}

module.exports = Publication