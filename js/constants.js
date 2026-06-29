// Bicol University GWA Calculator — Constants & Curriculum Presets (Exact Page 28 BU Student Handbook BOR Res. 89 s. 2006)

const VALID_GRADES = [
    { val: "1.0", label: "1.0 — 99-100%" },
    { val: "1.1", label: "1.1 — 98%" },
    { val: "1.2", label: "1.2 — 97%" },
    { val: "1.3", label: "1.3 — 96%" },
    { val: "1.4", label: "1.4 — 95%" },
    { val: "1.5", label: "1.5 — 94%" },
    { val: "1.6", label: "1.6 — 93%" },
    { val: "1.7", label: "1.7 — 92%" },
    { val: "1.8", label: "1.8 — 91%" },
    { val: "1.9", label: "1.9 — 90%" },
    { val: "2.0", label: "2.0 — 89%" },
    { val: "2.1", label: "2.1 — 88%" },
    { val: "2.2", label: "2.2 — 87%" },
    { val: "2.3", label: "2.3 — 86%" },
    { val: "2.4", label: "2.4 — 85%" },
    { val: "2.5", label: "2.5 — 84%" },
    { val: "2.6", label: "2.6 — 82-83%" },
    { val: "2.7", label: "2.7 — 80-81%" },
    { val: "2.8", label: "2.8 — 78-79%" },
    { val: "2.9", label: "2.9 — 76-77%" },
    { val: "3.0", label: "3.0 — 75%" },
    { val: "4.0", label: "4.0 — Below 75%" },
    { val: "5.0", label: "5.0 — Below 75%" },
    { val: "INC", label: "INC — Incomplete" },
    { val: "DRP", label: "DRP — Dropped" }
];

const HONOR_THRESHOLDS = {
    SUMMA: { maxGWA: 1.2500, label: "Summa Cum Laude" },
    MAGNA: { maxGWA: 1.4500, label: "Magna Cum Laude" },
    CUM:   { maxGWA: 1.7500, label: "Cum Laude" }
};

const SCHOLARSHIP_PRESETS = {
    dost:        { name: "DOST-SEI Merit",      maxGWA: 2.50, lowestGrade: 3.0, noInc: true,  noFail: true  },
    ched_full:   { name: "CHED Full Merit",      maxGWA: 1.75, lowestGrade: 2.5, noInc: true,  noFail: true  },
    ched_half:   { name: "CHED Half Merit",      maxGWA: 2.50, lowestGrade: 3.0, noInc: true,  noFail: true  },
    tes:         { name: "TES (Tertiary Ed)",    maxGWA: 3.00, lowestGrade: 3.0, noInc: false, noFail: false },
    bu_athletic: { name: "BU Athletic Scholar",  maxGWA: 3.00, lowestGrade: 3.0, noInc: true,  noFail: true  }
};

// 7 Curated Unique Quotes/Messages per Category
const HONOR_MESSAGES = {
    PL: [
        "🏆 Outstanding excellence! You've officially secured President's Lister honors this term!",
        "👑 Top of the class! Your focus and discipline earned you a spot on the President's List!",
        "🌟 Phenomenal performance! Achieving President's Lister proves your relentless drive.",
        "✨ Simply extraordinary! You've set the gold standard of academic brilliance.",
        "🔥 Unstoppable force! Your impressive GPA proves that consistency yields greatness.",
        "💎 Pure perfection! You handled your academic load with utmost mastery and honor.",
        "🚀 Reaching new heights! Your President's Lister award inspires your entire college."
    ],
    DL: [
        "🌟 Fantastic work! You've officially earned your place on the Dean's List this semester!",
        "🏅 High academic distinction! Your diligence and perseverance yielded Dean's Lister honors.",
        "🎉 Well deserved! Dean's Lister recognition proves your commitment to growth.",
        "✨ Stellar term performance! You're making continuous strides toward excellence.",
        "🔥 Remarkable dedication! Dean's Lister is a testament to your steady hard work.",
        "💎 Impressive accomplishment! Keep pushing your limits as an honor student.",
        "🚀 Soaring high! Your Dean's Lister award reflects your strong scholarly ambition."
    ],
    REGULAR: [
        "💪 Every semester is a stepping stone. Your resilience today builds tomorrow's glory!",
        "✨ Progress over perfection! Stay dedicated and watch your potential unfold next term.",
        "🔥 Success is the sum of small daily efforts. Keep pushing forward with pride!",
        "🎯 Growth happens through persistence. Learn from this term and conquer the next!",
        "🌱 Setbacks are temporary, but your grit is permanent. Keep your eyes on the goal!",
        "⚡ Fall seven times, stand up eight! You have the power to rise higher next semester.",
        "📚 Consistency creates champions. Keep grinding and your breakthrough will come!"
    ],
    UNDERLOAD: [
        "🌱 Education is a personal marathon, not a sprint. Honor your own unique pace!",
        "💡 Quality of learning beats quantity of units. Be proud of taking care of your wellness.",
        "⚡ Taking a custom load shows wisdom and self-awareness. Keep mastering your courses!",
        "🌈 Your academic journey is uniquely yours. Move at the speed that ensures your success.",
        "💪 A lighter load lets you shine brighter in every subject. Stay focused on mastery!",
        "✨ Balance is key to long-term triumph. Value your peace while achieving your degree.",
        "🎯 Every step forward is real progress, no matter the unit count. Keep going strong!"
    ],
    SUMMA: [
        "👑 Absolute pinnacle of academic distinction! Candidate for Summa Cum Laude! 🎉",
        "🏆 Legendary achievement! Your Summa Cum Laude standing places you among the elites!",
        "🌟 Historical brilliance! Maintaining a Summa Cum Laude GWA is monumental.",
        "✨ Flawless dedication! You represent the apex of scholastic excellence.",
        "🎉 Mind-blowing achievement! Summa Cum Laude is the ultimate crown of your college life.",
        "🔥 Peerless academic titan! Your name belongs in Bicol University's hall of fame.",
        "💎 Rare academic gemstone! You've maintained perfection across your entire degree."
    ],
    MAGNA: [
        "🌟 High academic distinction! Candidate for Magna Cum Laude! 🎉",
        "🏅 Stellar accomplishment! Magna Cum Laude honors reflect your exceptional intellect.",
        "🎉 Outstanding triumph! Celebrating your Magna Cum Laude candidacy today!",
        "✨ High distinction scholar! Your hard work placed you in the top tier of graduates.",
        "🔥 Remarkable brilliance! Magna Cum Laude is a glowing testament to your perseverance.",
        "💎 Exquisite achievement! You've maintained high honors throughout your college stay.",
        "🚀 Bound for greatness! Magna Cum Laude distinction opens vast horizons for your future."
    ],
    CUM: [
        "🏅 Graduation with distinction! Candidate for Cum Laude honors! 🎉",
        "🌟 Fantastic milestone! Your Cum Laude candidate status celebrates your hard work.",
        "🎉 Well-deserved honor! Graduating Cum Laude is a proud testament to your dedication.",
        "✨ Honorable distinction! You've maintained solid academic performance throughout college.",
        "🔥 Continuous drive! Cum Laude honors prove your commitment to scholarly growth.",
        "💎 Valued achievement! Graduating Cum Laude sets a strong foundation for your career.",
        "🚀 Launchpad to success! Your Cum Laude candidacy opens exciting opportunities."
    ],
    NOT_LAUDE: [
        "🎓 You are a victorious candidate for graduation! Every graduate is a champion!",
        "✨ A degree is a lifetime achievement! Be proud of overcoming every academic challenge.",
        "🔥 Your worth isn't defined by a title. Your practical skills and resilience will shine!",
        "🎯 Goal achieved: Completing a degree program in Bicol University is a massive accomplishment!",
        "🌱 Great things await! Real-world success rewards grit, passion, and adaptability.",
        "⚡ You conquered college! Be proud of every late night and exam you successfully passed.",
        "📚 Knowledge is power! The real test begins now, and you are fully equipped."
    ]
};

function getHonorMessage(category) {
    const list = HONOR_MESSAGES[category] || HONOR_MESSAGES.REGULAR || HONOR_MESSAGES.NOT_LAUDE;
    return list[Math.floor(Math.random() * list.length)];
}

function getRandomQuote() {
    const categories = Object.keys(HONOR_MESSAGES);
    const randomCat = categories[Math.floor(Math.random() * categories.length)];
    return getHonorMessage(randomCat);
}

const COLLEGE_PRESETS = {
    BUCS: [
        { title: "1st Year - 1st Semester", underload: false, subjects: [
            { code: "GEC 11", name: "Understanding the Self", grade: "1.2", units: 3 },
            { code: "GEC 12", name: "Readings in Philippine History", grade: "1.5", units: 3 },
            { code: "CS 111", name: "Introduction to Computing", grade: "1.2", units: 3 },
            { code: "CS 112", name: "Computer Programming 1", grade: "1.5", units: 3 },
            { code: "MATH 111", name: "Calculus 1", grade: "1.7", units: 4 },
            { code: "NSTP 1", name: "National Service Training Program 1", grade: "1.2", units: 3 }
        ]},
        { title: "1st Year - 2nd Semester", underload: false, subjects: [
            { code: "GEC 13", name: "The Contemporary World", grade: "1.5", units: 3 },
            { code: "GEC 14", name: "Mathematics in the Modern World", grade: "1.2", units: 3 },
            { code: "CS 121", name: "Computer Programming 2", grade: "1.5", units: 3 },
            { code: "CS 122", name: "Discrete Structures", grade: "1.7", units: 3 },
            { code: "NSTP 2", name: "National Service Training Program 2", grade: "1.2", units: 3 }
        ]}
    ],
    BUCENG: [
        { title: "1st Year - 1st Semester", underload: false, subjects: [
            { code: "MATH 101", name: "Calculus for Engineers 1", grade: "1.7", units: 4 },
            { code: "CHEM 101", name: "Chemistry for Engineers", grade: "1.5", units: 4 },
            { code: "ENG 101", name: "Engineering Graphics", grade: "1.5", units: 3 },
            { code: "GEC 11", name: "Understanding the Self", grade: "1.2", units: 3 },
            { code: "NSTP 1", name: "CWTS / ROTC 1", grade: "1.2", units: 3 }
        ]}
    ],
    BUCBEM: [
        { title: "1st Year - 1st Semester", underload: false, subjects: [
            { code: "BM 101", name: "Principles of Management", grade: "1.5", units: 3 },
            { code: "ECON 101", name: "Basic Microeconomics", grade: "1.2", units: 3 },
            { code: "ACT 101", name: "Financial Accounting 1", grade: "1.7", units: 3 },
            { code: "GEC 11", name: "Understanding the Self", grade: "1.2", units: 3 }
        ]}
    ],
    BUCE: [
        { title: "1st Year - 1st Semester", underload: false, subjects: [
            { code: "EDUC 101", name: "The Child and Adolescent Learners", grade: "1.2", units: 3 },
            { code: "EDUC 102", name: "The Teaching Profession", grade: "1.5", units: 3 },
            { code: "GEC 11", name: "Understanding the Self", grade: "1.2", units: 3 }
        ]}
    ],
    BUCN: [
        { title: "1st Year - 1st Semester", underload: false, subjects: [
            { code: "NURS 101", name: "Anatomy and Physiology", grade: "1.5", units: 5 },
            { code: "NURS 102", name: "Theoretical Foundations in Nursing", grade: "1.2", units: 3 },
            { code: "GEC 11", name: "Understanding the Self", grade: "1.2", units: 3 }
        ]}
    ],
    BUCIT: [
        { title: "1st Year - 1st Semester", underload: false, subjects: [
            { code: "IT 101", name: "Introduction to IT", grade: "1.2", units: 3 },
            { code: "IT 102", name: "Computer Hardware Fundamentals", grade: "1.5", units: 3 },
            { code: "GEC 11", name: "Understanding the Self", grade: "1.2", units: 3 }
        ]}
    ]
};
