var m = require("mithril")

var Bio = {
    pic: '../assets/profile-pic.jpg',

    biography: [
        'Kaarthik is a scientst in the ',
        m('a', {
            href: 'https://organizations.lanl.gov/a-1/',
            class: 'link dim gray hover-blue', 
            target: "_blank", rel: "noopener noreferrer"
        }, 'Information Systems and Modeling'),
        ' at ',
        m('a', {href: 'https://www.lanl.gov/', class: 'link dim gray hover-dark-blue', 
        target: "_blank", rel: "noopener noreferrer"}, 
        'Los Alamos National Laboratory (LANL)'),
        '. At LANL, he is also a part of the ',
        m('a', { href: 'https://lanl-ansi.github.io', 
        class: 'link dim gray hover-dark-blue',
        target: "_blank", rel: "noopener noreferrer"}, 
        'Advanced Network Science Initiative'), 
        '.',
    ],
    
    research: [
        'His research interests lie at the intersection of optimization,',
        ' control, and machine learning applied to complex systems. In particular,',
        ' his expertise lies in the areas of mathematical programming, large scale', 
        ' deterministic and stochastic optimization, optimal control, heuristics,', 
        ' approximation algorithms and reinforcement learning. He applies these',
        ' techniques to solve problems that arise in the domains of pipeline', 
        ' infrastucture systems transportation systems, decarbonization of', 
        ' energy infrastucture systems improving the resiliency of infrastucture',
        ' systems in the face of climate impacts robotics, and autonomous systems. '
    ],

    cv: '../assets/kaarthik-sundar-cv.pdf',
       
    email: 'mailto:kaarthik@lanl.gov',

    github: 'https://github.com/kaarthiksundar',

    scholar: 'https://scholar.google.com/citations?user=jAAj8DAAAAAJ&hl=en',

    theoryInterests: [
        'Mathematical Programming',
        'Global Optimization',
        'Optimal Control Theory',
        'Dynamics and Control',
        'Approximation Algorithms', 
        'Reinforcement Learning'
    ],

    appliedInterests: [
        'Pipeline Infrastructure Systems',
        'Transportation Systems',
        'Interdependent Energy Infrastructure Systems',
        'Supply Chain Systems',
        'Decarbonization Planning', 
        'Dynamical Systems'
    ],

    softwares: [
        'He also loves to write production-quality code, even for his research work.', 
        ' He writes production code in C++, Kotlin, Python and Julia.',
        ' He extensively uses gnuplot for plotting.',
        ' He has written code in C, C++, Java, Julia, Kotlin, and Python for his ',
        'research work. Furthermore, he also maintains and/or develops a number of Julia packages.', 
        ' Some of them are ',
        m('a', { href: 'https://github.com/kaarthiksundar/Dubins.jl', class: 'link dim gray hover-dark-blue',
        target: "_blank", rel: "noopener noreferrer"}, 'Dubins.jl'), ' and ',
        m('a', { href: 'https://github.com/sujeevraja/PolyhedralRelaxations.jl', class: 'link dim gray hover-dark-blue', target: "_blank", rel: "noopener noreferrer"}, 
        'PolyhedralRelaxations.jl'), '.'
    ]
}

module.exports = Bio