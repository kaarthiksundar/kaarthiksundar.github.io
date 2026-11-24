var m = require("mithril");
var Layout = require("./views/Layout");
const Home = require("./views/Home")
const PublicationBox = require("./views/PublicationBox");
const ExperienceBox = require("./views/ExperienceBox");
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

m.route.prefix = "";

m.route(document.body, "/", {
    "/": buildRouteResolver(Home),
    "/experience": buildRouteResolver(ExperienceBox),
    "/publications": buildRouteResolver(PublicationBox),
    "/group": buildRouteResolver(StudentBox)
});


