var m = require("mithril");
var Layout = require("./views/Layout");
const Home = require("./views/Home")
const PublicationBox = require("./views/PublicationBox");
const ExperienceBox = require("./views/ExperienceBox");
const StudentBox = require("./views/StudentBox");

// Details on how the following route is designed can be founde at:
// https://mithril.js.org/route.html#advanced-component-resolution
function setPageMetadata(title, description) {
    document.title = title
    var descriptionTag = document.querySelector('meta[name="description"]')
    if (descriptionTag) descriptionTag.setAttribute('content', description)
}

function buildRouteResolver(component, title, description) {
    return {
        render: function () {
            setPageMetadata(title, description)
            return m(Layout, m(component))
        }
    }
};

m.route.prefix = "";

m.route(document.body, "/", {
    "/": buildRouteResolver(
        Home,
        "Kaarthik Sundar — Research",
        "Kaarthik Sundar is a staff scientist at Los Alamos National Laboratory working on networked energy systems, optimization, control, and autonomous systems."
    ),
    "/experience": buildRouteResolver(
        ExperienceBox,
        "Experience — Kaarthik Sundar",
        "Research appointments and education of Kaarthik Sundar."
    ),
    "/publications": buildRouteResolver(
        PublicationBox,
        "Publications — Kaarthik Sundar",
        "Journal articles, conference papers, and preprints by Kaarthik Sundar."
    ),
    "/group": buildRouteResolver(
        StudentBox,
        "Group — Kaarthik Sundar",
        "Kaarthik Sundar's mentoring of postdoctoral researchers and student interns, along with doctoral committee service."
    )
});


