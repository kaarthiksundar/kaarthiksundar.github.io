var m = require("mithril")

var Bio = {
    pic: '../assets/profile-pic.jpg',

    biography: [
        'Kaarthik is a scientst in the',
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
        'His research interests lie at the Safe, Efficient, Equitable and Resilient',
        ' (SEER) operations and decarbonization planning for infrastucture and autonomous',
        ' systems. In particular,',
        ' his expertise lies in the areas of mathematical programming, large scale', 
        ' deterministic and stochastic optimization, optimal control, heuristics,', 
        ' approximation algorithms and reinforcement learning. He applies these',
        ' techniques to solve problems that arise in the domains of pipeline', 
        ' infrastucture systems, transportation systems, robotics,',
        ' autonomous systems, decarbonization of energy infrastucture systems,',
        ' and improving the resiliency of infrastructure',
        ' systems in the face of climate impacts. '
    ],

    cv: '../assets/kaarthik-sundar-cv.pdf',
       
    email: 'mailto:kaarthik@lanl.gov',

    github: 'https://github.com/kaarthiksundar',

    scholar: 'https://scholar.google.com/citations?user=jAAj8DAAAAAJ&hl=en',

    linkedin: 'https://www.linkedin.com/in/kaarthiksundar/',
    
    theoryInterests: [
        'Mathematical Programming',
        'Global Optimization',
        'Optimal Control Theory',
        'Dynamics and Control',
        'Approximation Algorithms', 
        'Reinforcement Learning'
    ],

    appliedInterests: [
        'Autonomous Systems',
        'Pipeline Infrastructure Systems',
        'Interdependent Energy Infrastructure Systems',
        'Transportation Systems',
        'Decarbonization Planning',
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