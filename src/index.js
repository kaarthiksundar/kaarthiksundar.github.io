var m = require("mithril");
var Layout = require("./views/Layout");
var Home = require("./views/Home")
var PublicationBox = require("./views/PublicationBox");
// const ExperienceBox = require("./views/ExperienceBox");
const ResearchBox = require("./views/ResearchBox");
const StudentBox = require("./views/StudentBox");

// Details on how the following route is designed can be founde at:
// https://mithril.js.org/route.html#advanced-component-resolution
function buildRouteResolver(component) {
    return {
        render: function () {
            return m(Layout, m(component))
        }
    }
};

m.route(document.body, "/", {
    "/": buildRouteResolver(Home),
    "/research": buildRouteResolver(ResearchBox),
    // "/experience": buildRouteResolver(ExperienceBox),
    "/publications": buildRouteResolver(PublicationBox),
    "/students": buildRouteResolver(StudentBox)
});


