var m = require("mithril")

var Bio = {
    pic: '../assets/profile-pic.jpg',

    biography: [
        'Kaarthik is a scientist in the',
        ' Information Systems and Modeling Group',
        ' at Los Alamos National Laboratory (LANL)',
        '. At LANL, he is also a part of the ',
        m('a', { href: 'https://lanl-ansi.github.io', 
        class: 'link dark-gray hover-blue',
        target: "_blank", rel: "noopener noreferrer"}, 
        'Advanced Network Science Initiative'), 
        '.',
    ],
    
    research: [
        'His research interests are centered around the following',
        ' applications: interdependent energy infrastucture systems,',
        ' transportation systems, and autonomous systems. From a theoretical,', 
        ' stand-point his expertise lies in the areas of nonlinear control, boundary',
        ' control of partial differential equations, mathematical programming,',
        ' large scale deterministic and stochastic optimization,', 
        ' approximation algorithms and Bayesian learning.'
    ],

    cv: '../assets/kaarthik-sundar-cv.pdf',
       
    email: 'mailto:kaarthik@lanl.gov',

    github: 'https://github.com/kaarthiksundar',

    scholar: 'https://scholar.google.com/citations?user=jAAj8DAAAAAJ&hl=en',

    linkedin: 'https://www.linkedin.com/in/kaarthiksundar/',
    
    theoryInterests: [
        'Boundary Control of Partial Differential Equations',
        'Mathematical Programming',
        'Global Optimization',
        'Dynamics and Control',
        'Approximation Algorithms', 
        'Bayesian Learning'
    ],

    appliedInterests: [
        'Pipeline Infrastructure Systems',
        'Power Grids',
        'Autonomous Systems',
        'Transportation Systems',
        'Supply Chain Systems'
    ],

    softwares: [
        'He also loves to write production-quality code, even for his research work.', 
        ' He writes production code in C++, Kotlin, Python and Julia.',
        ' He extensively uses gnuplot for plotting.',
        ' He has written code in C, C++, Java, Julia, Kotlin, and Python for his ',
        'research work. Furthermore, he also maintains and/or develops a number of Julia packages.', 
        ' Some of them are ',
        m('a', { href: 'https://github.com/kaarthiksundar/Dubins.jl', class: 'link dark-gray hover-dark-blue',
        target: "_blank", rel: "noopener noreferrer"}, 'Dubins.jl'), ' and ',
        m('a', { href: 'https://github.com/sujeevraja/PolyhedralRelaxations.jl', class: 'link dark-gray hover-dark-blue', target: "_blank", rel: "noopener noreferrer"}, 
        'PolyhedralRelaxations.jl'), '.'
    ]
}

module.exports = Bio