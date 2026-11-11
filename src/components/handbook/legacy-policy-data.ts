/** Content transcribed from legacy HandbookPolicies; presentation and evaluator are separate. */
export const LEGACY_POLICY_TABLES = [
  {
    "headers": [
      "Grade Rating",
      "Adjectival Rating",
      "Percentage Equivalent",
      "Academic Status"
    ],
    "rows": [
      [
        "1.0 – 1.4",
        "Outstanding",
        "95 – 100%",
        "Passed • recognition requires full record review"
      ],
      [
        "1.5 – 1.7",
        "Superior",
        "92 – 94%",
        "Passed • recognition requires full record review"
      ],
      [
        "1.8 – 2.5",
        "Very Satisfactory",
        "84 – 91%",
        "Passed • PL/DL subject cap is 2.4; 2.5 excludes both"
      ],
      [
        "2.6 – 2.8",
        "Satisfactory",
        "78 – 83%",
        "Passed"
      ],
      [
        "2.9 – 3.0",
        "Fair / Average",
        "75 – 77%",
        "Passed (3.00 Passing Mark)"
      ],
      [
        "3.1 – 4.0",
        "Poor / Conditional",
        "Below 75",
        "Conditional Deficient Mark"
      ],
      [
        "5.0",
        "Failure",
        "Below 75",
        "Lowest Final Rating (Deficiency)"
      ],
      [
        "INC",
        "Incomplete",
        "Requirements Pending",
        "Must resolve within 1 school year"
      ],
      [
        "DRP",
        "Dropped",
        "Officially Withdrawn",
        "Excluded from GWA math"
      ]
    ]
  },
  {
    "headers": [
      "Honor Level",
      "Semester GPA Cutoff",
      "Individual Grade Cap",
      "Key Eligibility Criteria"
    ],
    "rows": [
      [
        "President's Lister (PL)",
        "1.0000 ≤ GWA ≤ 1.4500",
        "No numeric subject grade above 2.40",
        "Confirmed regular curriculum load; complete grades; no failing or incomplete marks"
      ],
      [
        "Dean's Lister (DL)",
        "1.4500 < GWA ≤ 1.7500",
        "No numeric subject grade above 2.40",
        "Confirmed regular curriculum load; complete grades; no failing or incomplete marks"
      ]
    ]
  },
  {
    "headers": [
      "Honor Level",
      "Exact Cumulative GWA Range",
      "Key Handbook Requirements"
    ],
    "rows": [
      [
        "Summa Cum Laude",
        "1.0000 ≤ GWA ≤ 1.2500",
        "No subject grade above 3.00; curriculum completion, prescribed regular loads and applicable residency verified by the University"
      ],
      [
        "Magna Cum Laude",
        "1.2500 < GWA ≤ 1.4500",
        "No subject grade above 3.00; curriculum completion, prescribed regular loads and applicable residency verified by the University"
      ],
      [
        "Cum Laude",
        "1.4500 < GWA ≤ 1.7500",
        "No subject grade above 3.00; curriculum completion, prescribed regular loads and applicable residency verified by the University"
      ]
    ]
  }
] as const;

export const LEGACY_POLICY_ARTICLES = [
  [
    "Grading System & GWA Math",
    "Grading System, printed p. 18 / PDF p. 28; Graduation with Honors, printed p. 20 / PDF p. 30",
    "Grades are listed in tenths from 1.0 through 3.0; 4.0 is conditional and 5.0 failure. GWA weights numeric grades by positive units, excludes INC/DRP and is displayed to four decimals."
  ],
  [
    "Regular Curriculum Load & Underload",
    "Graduation with Honors, printed p. 21 / PDF p. 31; Scholarship General Policies, printed p. 31 / PDF p. 41",
    "Regular load is the load prescribed by the curriculum for that semester, not a universal 15-unit threshold. The handbook excludes underloaded candidates from graduation honors. Confirm curriculum requirements and any applicable ruling with the college."
  ],
  [
    "President's & Dean's Lister Honors",
    "Academic Distinctions, printed p. 32 / PDF p. 42",
    "PL requires 1.0000 ≤ GWA ≤ 1.4500; DL requires 1.4500 < GWA ≤ 1.7500. Both exclude any numeric subject grade above 2.4. The calculator checks complete grades and prescribed regular load; a 2.5 excludes both distinctions. It displays term distinctions for regular semesters."
  ],
  [
    "Latin Graduation Honors",
    "Graduation with Honors, printed pp. 20–21 / PDF pp. 30–31",
    "GWA ceilings are 1.25/1.45/1.75 for Summa/Magna/Cum Laude. No subject grade may be numerically above 3.0. Curriculum completion, regular prescribed loads and applicable residency need University verification. The adjacent academic-distinction clause specifies 75% of units at BU and six immediately preceding residence terms."
  ],
  [
    "Incomplete (INC) Removal Timeline",
    "The Grade of Incomplete, printed p. 20 / PDF p. 30",
    "Students have one school year for completion. Until removed, INC is excluded from GWA. The College Registrar converts an overdue INC to failure upon written instruction from the professor; the Dean may decide if the professor cannot be contacted."
  ],
  [
    "Maximum Residency Rule (MRR)",
    "Section III, Maximum Residence Rule, printed p. 17 / PDF p. 27",
    "Maximum residence is the prescribed program duration plus one year (five years for a four-year program). Confirm applicable exceptions with the University."
  ]
] as const;
