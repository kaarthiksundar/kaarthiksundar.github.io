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
        }).sort().reverse()));
    }, 
    selectedYearValue: 1,
    searchString: '',
    getPubs: function(year) {
        if (year == 'All') {
            conferences = Publication.list.filter( function (pub) {
                return (pub.type == "conference")
            });
            journals = Publication.list.filter( function (pub) {
                return (pub.type == "journal")
            });
            preprints = Publication.list.filter( function (pub) {
                return (pub.type == "preprint")
            });
            conferences.sort((a, b) => (a.year > b.year) ? -1 : 1)
            journals.sort((a, b) => (a.year > b.year) ? -1 : 1)
            preprints.sort((a, b) => (a.year > b.year) ? -1 : 1)
    
            return [conferences, journals, preprints]
        }
        conferences = Publication.list.filter( function (pub) {
            return (pub.type == "conference" && pub.year == year)
        });
        journals = Publication.list.filter( function (pub) {
            return (pub.type == "journal" && pub.year == year)
        });
        preprints = Publication.list.filter( function (pub) {
            return (pub.type == "preprint" && pub.year == year)
        });
        return [conferences, journals, preprints]
    }
}

module.exports = Publication