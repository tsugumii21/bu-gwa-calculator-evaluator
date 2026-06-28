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

// 20 Unique Quotes/Messages per Category (7 categories x 20 = 140 total)
const HONOR_MESSAGES = {
    PL: [
        "🏆 Outstanding excellence! You've officially secured President's Lister honors this term!",
        "👑 Top of the class! Your hard work and focus earned you a spot on the President's List!",
        "🌟 Phenomenal performance! Achieving President's Lister is proof of your relentless dedication.",
        "✨ Simply extraordinary! You've set a gold standard of academic brilliance this semester.",
        "🎉 Huge congratulations! President's Lister recognition belongs to champions like you!",
        "🔥 Unstoppable force! Your impressive GPA proves that consistency yields greatness.",
        "💎 Pure perfection! You handled your academic load with utmost mastery and honor.",
        "🚀 Reaching new heights! Your President's Lister award inspires your entire college.",
        "🎯 Spot on target! Excellence is not an act, but a habit you've clearly mastered.",
        "🥇 Gold standard student! Keep shining bright as one of BU's finest academic achievers.",
        "📚 Masterful execution! Your grades reflect sleepless nights turned into glory.",
        "🌈 Brilliant victory! Celebrating your hard-earned President's Lister honor today!",
        "⭐ Stellar academic achievement! Your dedication continues to pay rich dividends.",
        "⚡ Academic powerhouse! You proved that passion and discipline create miracles.",
        "🎓 Scholarly brilliance! You are making your mentors and family immensely proud.",
        "🌟 Shining star of BU! President's Lister is a well-deserved milestone on your path.",
        "💪 Unshakable focus! You conquered every subject with true academic mastery.",
        "🏆 Champion of academic rigor! Bask in the pride of your President's Lister recognition.",
        "✨ Illuminating success! Your dedication shines brightly across your department.",
        "🎉 Spectacular achievement! Here's to honoring your President's Lister distinction!"
    ],
    DL: [
        "🌟 Fantastic work! You've officially earned your place on the Dean's List this semester!",
        "🏅 High academic distinction! Your diligence and perseverance yielded Dean's Lister honors.",
        "🎉 Well deserved! Dean's Lister recognition proves your commitment to academic growth.",
        "✨ Stellar term performance! You're making continuous strides toward excellence.",
        "🔥 Remarkable dedication! Dean's Lister is a testament to your steady hard work.",
        "💎 Impressive accomplishment! Keep pushing your limits as an honor student.",
        "🚀 Soaring high! Your Dean's Lister award reflects your strong scholarly ambition.",
        "🎯 Mission accomplished! You balanced your subjects with commendable success.",
        "🥈 Outstanding honor! Celebrating your well-earned Dean's Lister distinction today.",
        "📚 Consistent growth! You tackled every assignment and exam with determination.",
        "🌈 Bright academic future! Your Dean's Lister badge is proof of your capabilities.",
        "⭐ High achiever alert! Keep up the incredible momentum in your studies.",
        "⚡ Academic brilliance in motion! You've proven your resilience and strength.",
        "🎓 Proud milestone! Dean's Lister honors highlight your intellectual discipline.",
        "🌟 Inspiring dedication! You've proven that persistent effort always pays off.",
        "💪 Victorious semester! Congratulations on achieving Dean's Lister honors!",
        "🏆 Top-tier dedication! Your hard work has earned the respect of your faculty.",
        "✨ Radiating success! May this Dean's Lister award inspire your next semester.",
        "🎉 Superb results! Celebrate this academic victory and keep striving higher.",
        "🥇 Honor roll member! Your Dean's Lister achievement is worth celebrating!"
    ],
    NOT_PL_DL: [
        "💪 Every semester is a stepping stone. Keep striving, your comeback is loading!",
        "✨ Don't watch the clock; do what it does. Keep going and rise next term!",
        "🔥 Success is the sum of small efforts repeated daily. Stay focused and push on!",
        "🎯 Growth happens outside comfort zones. Learn from this term and conquer the next!",
        "🌱 Setbacks are temporary; your potential is permanent. Believe in your journey!",
        "⚡ Fall seven times, stand up eight! You have the strength to achieve honors next time.",
        "📚 Your current grade doesn't define your future glory. Keep studying with passion!",
        "🚀 Dust yourself off and refocus. Great achievements require time and perseverance.",
        "💡 Difficulties are intended to make us better, not bitter. Keep your head held high!",
        "🌈 Every cloud has a silver lining. Refuel your drive for an extraordinary next term!",
        "⭐ Believe in yourself! You are capable of turning things around in the coming semester.",
        "🎓 Experience is a great teacher. Use this term's lessons to fuel your comeback!",
        "💪 Champion mindset: Learn, adapt, and return stronger than ever before!",
        "✨ Your dedication today builds tomorrow's victory. Keep pushing your boundaries!",
        "🎉 Keep your eyes on the prize! With structured study habits, honors are within reach.",
        "🔥 No storm lasts forever. Stay disciplined, work hard, and ignite your comeback!",
        "💎 Diamonds are formed under pressure. Trust the process and keep grinding!",
        "🌟 The secret of getting ahead is getting started. Begin your preparation today!",
        "🎯 Refine your strategy and aim higher. Your academic breakthrough is ahead!",
        "⚡ Stay resilient! Next semester offers a fresh canvas for you to paint your success."
    ],
    SUMMA: [
        "👑 Absolute pinnacle of academic distinction! Candidate for Summa Cum Laude! 🎉",
        "🏆 Legendary achievement! Your Summa Cum Laude standing places you among the elites!",
        "🌟 Historical brilliance! Maintaining a Summa Cum Laude GWA is truly monumental.",
        "✨ Flawless dedication! You represent the absolute apex of scholastic excellence.",
        "🎉 Mind-blowing achievement! Summa Cum Laude is the ultimate crown of your college life.",
        "🔥 Peerless academic titan! Your name will be remembered in Bicol University's hall of fame.",
        "💎 Rare academic gemstone! You've maintained perfection across your entire degree.",
        "🚀 Infinite possibilities await! Summa Cum Laude honors reflect your genius and grit.",
        "🎯 Perfect mastery! Achieving Summa Cum Laude proves your boundless intellectual power.",
        "🥇 Unrivaled scholar! Bask in the glory of being Bicol University's top candidate for honors.",
        "📚 Masterwork of education! Your academic transcript is an inspiration to all.",
        "🌈 Radiant triumph! Celebrating your Summa Cum Laude candidacy with immense pride!",
        "⭐ Supreme honor unlocked! You've redefined academic excellence in your college.",
        "⚡ Electrifying genius! Summa Cum Laude distinction is a testament to your spirit.",
        "🎓 Institutional pride! You embody the highest ideals of Bicol University.",
        "🌟 Monumental victory! Your Summa Cum Laude standing shines like a beacon.",
        "💪 Unconquerable intellect! You conquered every academic milestone with perfection.",
        "🏆 Crown jewel of BU! Summa Cum Laude honors celebrate your incredible journey.",
        "✨ Extraordinary distinction! May your Summa Cum Laude standing open infinite doors.",
        "🎉 Majestic success! Congratulations on candidate standing for Summa Cum Laude!"
    ],
    MAGNA: [
        "🌟 High academic distinction! Candidate for Magna Cum Laude! 🎉",
        "🏅 Stellar accomplishment! Magna Cum Laude honors reflect your exceptional intellect.",
        "🎉 Outstanding triumph! Celebrating your Magna Cum Laude candidacy today!",
        "✨ High distinction scholar! Your hard work has placed you in the top tier of graduates.",
        "🔥 Remarkable brilliance! Magna Cum Laude is a glowing testament to your perseverance.",
        "💎 Exquisite achievement! You've maintained high honors throughout your college stay.",
        "🚀 Bound for greatness! Magna Cum Laude distinction opens vast horizons for your career.",
        "🎯 Masterful consistency! You balanced complex subjects with superior grades.",
        "🥈 High honor candidate! Your Magna Cum Laude status brings immense pride.",
        "📚 Scholarly distinction! You tackled rigorous courses with unwavering dedication.",
        "🌈 Brilliant milestone! Magna Cum Laude honors showcase your intellectual strength.",
        "⭐ High-tier candidate! Your academic journey is crowned with high distinction.",
        "⚡ Electrifying performance! Magna Cum Laude candidacy proves your high caliber.",
        "🎓 Proud BU graduate candidate! Magna Cum Laude honors highlight your work ethic.",
        "🌟 Shining scholar! You've proven that consistent hard work creates high distinction.",
        "💪 Victorious candidate! Congratulations on reaching Magna Cum Laude candidacy!",
        "🏆 Top-ranked excellence! Your Magna Cum Laude honor is richly deserved.",
        "✨ Inspiring achievement! May your Magna Cum Laude standing launch a stellar career.",
        "🎉 Superb graduation standing! Celebrate your high distinction with joy!",
        "🥇 High-honors medalist! Your Magna Cum Laude candidate status is truly inspiring!"
    ],
    CUM: [
        "🏅 Graduation with distinction! Candidate for Cum Laude honors! 🎉",
        "🌟 Fantastic milestone! Your Cum Laude candidate status celebrates your hard work.",
        "🎉 Well-deserved honor! Graduating Cum Laude is a proud testament to your dedication.",
        "✨ Honorable distinction! You've maintained solid academic performance throughout college.",
        "🔥 Continuous drive! Cum Laude honors prove your commitment to scholarly growth.",
        "💎 Valued achievement! Graduating Cum Laude sets a strong foundation for your future.",
        "🚀 Launchpad to success! Your Cum Laude candidacy opens exciting opportunities.",
        "🎯 Target achieved! You successfully navigated your curriculum with distinction.",
        "🥉 Honorable distinction candidate! Celebrating your Cum Laude milestone today.",
        "📚 Steady perseverance! Your Cum Laude award highlights years of discipline.",
        "🌈 Bright graduation milestone! Cum Laude candidacy brings joy to your family.",
        "⭐ Distinguishing scholar! Keep carrying this pride as you graduate into the world.",
        "⚡ Solid academic performance! Cum Laude honors recognize your academic strength.",
        "🎓 Proud BU candidate! Graduating Cum Laude marks a memorable chapter.",
        "🌟 Inspiring journey! You proved that consistent effort yields honorable rewards.",
        "💪 Triumphant candidate! Congratulations on achieving Cum Laude graduation standing!",
        "🏆 Crown jewel of BU! Your Cum Laude candidate status is a badge of honor.",
        "✨ Shining graduate candidate! Enjoy the fruits of your academic labor.",
        "🎉 Superb graduation status! Celebrate your Cum Laude distinction with pride!",
        "🥇 Medal of honor! Your Cum Laude standing marks a successful college journey!"
    ],
    NOT_LAUDE: [
        "🎓 You are a victorious candidate for graduation! Every graduate is a champion!",
        "✨ A degree is a lifetime achievement! Be proud of overcoming every academic challenge.",
        "🔥 Your worth isn't defined by a title. Your practical skills and resilience will shine!",
        "🎯 Goal achieved: Completing a degree program in Bicol University is a massive accomplishment!",
        "🌱 Great things await! Real-world success rewards grit, passion, and adaptability.",
        "⚡ You conquered college! Be proud of every late night and exam you successfully passed.",
        "📚 Knowledge is power! The real test begins now, and you are fully equipped.",
        "🚀 Sky is the limit! Your diploma is your key to unlocking endless global opportunities.",
        "💡 Character over titles! Your integrity and hard work will take you far in life.",
        "🌈 Bright horizons ahead! Celebrate completing your college journey with head held high.",
        "⭐ Be proud of your journey! You survived the rigor of Bicol University and came out victorious.",
        "🎓 Graduation day victory! You earned your degree through sheer grit and willpower.",
        "💪 Resilient graduate! You proved that you have what it takes to finish the race.",
        "✨ The world needs your skills! Step out with confidence and make your mark.",
        "🎉 Huge congratulations! Crossing the graduation stage is a momentous victory.",
        "🔥 Your story is just beginning! Go out there and build an extraordinary life.",
        "💎 Pure resilience! You turned challenges into stepping stones toward your diploma.",
        "🌟 Celebrate your degree! You are ready to make a profound impact in society.",
        "🎯 Future leader in action! Wear your graduation gown with immense pride.",
        "⚡ Unstoppable graduate! Congratulations on completing your academic degree in Bicol University!"
    ]
};

function getHonorMessage(category) {
    const list = HONOR_MESSAGES[category] || HONOR_MESSAGES.NOT_PL_DL;
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
