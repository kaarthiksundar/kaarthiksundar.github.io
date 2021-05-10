var m = require("mithril")

var Bio = {
    pic: '../assets/profile-pic.jpg',
    
    description: [
        'Kaarthik Sundar is a staff-scientst in the',
        ' Information Systems and Modeling Group (A-1) at ',
        m('a', {href: 'https://www.lanl.gov/', class: 'link dim gray hover-dark-blue', 
        target: "_blank", rel: "noopener noreferrer"}, 
        'Los Alamos National Laboratory (LANL)'),
        '. At LANL, he is also a part of the ',
        m('a', { href: 'https://lanl-ansi.github.io', 
        class: 'link dim gray hover-dark-blue',
        target: "_blank", rel: "noopener noreferrer"}, 
        'Advanced Network Science Initiative'), 
        '. His research interests lie at the intersection of optimization,',
        ' control, and machine learning applied to transportation, pipeline',
        ' infrastructure systems, robotics, power systems, and decarbonization',
        ' of energy infrastructure systems.',
    ],

    cv: '../assets/kaarthik-sundar-cv.pdf',
       
    email: 'kaarthik@lanl.gov',

    github: 'https://github.com/kaarthiksundar',

    scholar: 'https://scholar.google.com/citations?user=jAAj8DAAAAAJ&hl=en',

    theoryInterests: [
        'Mathematical Programming',
        'Large scale Optimization',
        'Optimal Control Theory',
        'Dynamics and Control',
        'Heuristics',
        'Approximation Algorithms', 
        'Machine Learning'
    ],

    appliedInterests: [
        'Vehicle Routing',
        'Pipeline Infrastructure Systems',
        'Robotics',
        'Transportation',
        'Decarbonization',
        'Power Systems', 
        'Airline Crew Recovery'
    ],

    softwares: [
        'Kaarthik also loves to write production-quality code, even for his research work.', 
        ' He writes production code in C++, Kotlin, and Julia', 
        ' and relies heavily on Python3 for scripting.',
        ' He extensively uses gnuplot for plotting.',
        ' He has written code in C, C++, Java, Julia, Kotlin, and Python for his ',
        'research work. Furthermore, he also maintains and/or develops a number of Julia packages.', 
        ' Some of them are ',
        m('a', { href: 'https://github.com/lanl-ansi/GasModels.jl', class: 'link dim gray hover-dark-blue',
        target: "_blank", rel: "noopener noreferrer"}, 'GasModels.jl'), ',  ',
        m('a', { href: 'https://github.com/kaarthiksundar/Dubins.jl', class: 'link dim gray hover-dark-blue',
        target: "_blank", rel: "noopener noreferrer"}, 'Dubins.jl'), ', and ',
        m('a', { href: 'https://github.com/sujeevraja/PolyhedralRelaxations.jl', class: 'link dim gray hover-dark-blue', target: "_blank", rel: "noopener noreferrer"}, 
        'PolyhedralRelaxations.jl'), '. He also plays tennis, swims and snowboards.'
    ]
}

module.exports = Bio