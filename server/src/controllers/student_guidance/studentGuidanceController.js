const StudentGuidance = require("../../models/student_guidance/StudentGuidance");

const DEFAULT_INTERESTS = [
    { name: "Software Engineering", category: "Technology" },
    { name: "User Experience Design", category: "Design" },
    { name: "Data Analysis", category: "Analytics" },
];

const DEFAULT_SKILLS = [
    { name: "JavaScript", category: "Programming", level: "Intermediate" },
    { name: "React", category: "Frontend", level: "Intermediate" },
    { name: "SQL", category: "Database", level: "Beginner" },
];

const DEFAULT_EXAM_RESULTS = [
    {
        year: 1,
        semester: 1,
        subjects: [
            { subjectCode: "IT1010", subject: "Introduction to Programming", credits: 4, caPercentage: 88, grade: "A" },
            { subjectCode: "IT1020", subject: "Computer Systems Fundamentals", credits: 4, caPercentage: 81, grade: "A-" },
            { subjectCode: "IT1030", subject: "Mathematics for Computing", credits: 4, caPercentage: 76, grade: "B+" },
            { subjectCode: "IT1040", subject: "Communication Skills", credits: 3, caPercentage: 84, grade: "A-" },
        ],
    },
    {
        year: 1,
        semester: 2,
        subjects: [
            { subjectCode: "IT1550", subject: "Object Oriented Programming", credits: 4, caPercentage: 83, grade: "A-" },
            { subjectCode: "IT1560", subject: "Web Development", credits: 4, caPercentage: 89, grade: "A" },
            { subjectCode: "IT1570", subject: "Database Management Systems", credits: 4, caPercentage: 78, grade: "B+" },
            { subjectCode: "IT1580", subject: "Statistics for IT", credits: 3, caPercentage: 75, grade: "B+" },
        ],
    },
    {
        year: 2,
        semester: 1,
        subjects: [
            { subjectCode: "IT2010", subject: "Data Structures and Algorithms", credits: 4, caPercentage: 80, grade: "A-" },
            { subjectCode: "IT2020", subject: "Human Computer Interaction", credits: 3, caPercentage: 87, grade: "A" },
            { subjectCode: "IT2030", subject: "Software Engineering", credits: 4, caPercentage: 85, grade: "A-" },
            { subjectCode: "IT2040", subject: "Mobile Application Development", credits: 4, caPercentage: 77, grade: "B+" },
        ],
    },
    {
        year: 2,
        semester: 2,
        subjects: [
            { subjectCode: "IT2510", subject: "Object Oriented Programming", credits: 4, caPercentage: 79, grade: "B+" },
            { subjectCode: "IT2520", subject: "Web Application Development", credits: 4, caPercentage: 91, grade: "A" },
            { subjectCode: "IT2530", subject: "Database Systems", credits: 4, caPercentage: 86, grade: "A-" },
            { subjectCode: "IT2540", subject: "Professional Practices", credits: 3, caPercentage: 82, grade: "A-" },
        ],
    },
];

const CAREER_LIBRARY = [
    {
        title: "Frontend Developer",
        matchTags: ["Software Engineering", "User Experience Design", "JavaScript", "React"],
        summary: "Build responsive interfaces and collaborate closely with design teams.",
        nextStep: "Strengthen component architecture and accessibility practices with a portfolio project.",
    },
    {
        title: "Full Stack Developer",
        matchTags: ["Software Engineering", "JavaScript", "SQL", "Database Systems", "React"],
        summary: "Own features end-to-end across UI, APIs, and data storage.",
        nextStep: "Add one full-stack project with authentication, CRUD flows, and deployment.",
    },
    {
        title: "Data Analyst",
        matchTags: ["Data Analysis", "SQL", "Mathematics for Computing", "Analytics"],
        summary: "Turn data into dashboards, trends, and business recommendations.",
        nextStep: "Practice SQL querying and present findings in a simple visual dashboard.",
    },
    {
        title: "UI/UX Engineer",
        matchTags: ["User Experience Design", "React", "Communication Skills"],
        summary: "Bridge design and engineering by creating polished, user-centered experiences.",
        nextStep: "Showcase interactive prototypes and document design decisions for each case study.",
    },
];

const normalizeItems = (items, mapper) => {
    if (!Array.isArray(items)) {
        return [];
    }

    return items
        .map(mapper)
        .filter((item) => item && Object.values(item).every(Boolean));
};

const buildCareerSuggestions = (guidance) => {
    const interestTags = guidance.interests.map((interest) => interest.name);
    const skillTags = guidance.skills.flatMap((skill) => [skill.name, skill.category]);
    const subjectTags = guidance.examResults.flatMap((semester) =>
        semester.subjects.map((subject) => subject.subject)
    );
    const tags = new Set([...interestTags, ...skillTags, ...subjectTags]);

    const rankedSuggestions = CAREER_LIBRARY.map((career) => {
        const score = career.matchTags.reduce(
            (total, tag) => total + (tags.has(tag) ? 1 : 0),
            0
        );

        return {
            title: career.title,
            summary: career.summary,
            nextStep: career.nextStep,
            matchScore: score,
            matchedAreas: career.matchTags.filter((tag) => tags.has(tag)).slice(0, 4),
        };
    })
        .filter((career) => career.matchScore > 0)
        .sort((left, right) => right.matchScore - left.matchScore)
        .slice(0, 3);

    if (rankedSuggestions.length > 0) {
        return rankedSuggestions;
    }

    return [
        {
            title: "Associate Software Engineer",
            summary: "A balanced starting role that helps you keep exploring both technical depth and teamwork.",
            nextStep: "Build one practical portfolio app and document what you learned from the implementation.",
            matchScore: 1,
            matchedAreas: ["Academic progress"],
        },
    ];
};

const buildResponse = (guidance) => ({
    examResults: [...guidance.examResults].sort(
        (left, right) => left.year - right.year || left.semester - right.semester
    ),
    interests: guidance.interests,
    skills: guidance.skills,
    aspirations: guidance.aspirations,
    careerSuggestions: buildCareerSuggestions(guidance),
});

const mergeDefaultExamResults = (existingResults = []) => {
    const semesterMap = new Map(
        existingResults.map((semester) => [
            `${semester.year}-${semester.semester}`,
            semester,
        ])
    );

    for (const semester of DEFAULT_EXAM_RESULTS) {
        const key = `${semester.year}-${semester.semester}`;

        if (!semesterMap.has(key)) {
            semesterMap.set(key, semester);
        }
    }

    return [...semesterMap.values()].sort(
        (left, right) => left.year - right.year || left.semester - right.semester
    );
};

const getOrCreateStudentGuidance = async (studentId) => {
    let guidance = await StudentGuidance.findOne({ student: studentId });

    if (!guidance) {
        guidance = await StudentGuidance.create({
            student: studentId,
            examResults: DEFAULT_EXAM_RESULTS,
            interests: DEFAULT_INTERESTS,
            skills: DEFAULT_SKILLS,
            aspirations: "I want to build a strong technical foundation and choose a career path that fits my strengths.",
        });
    } else {
        const mergedExamResults = mergeDefaultExamResults(guidance.examResults);

        if (mergedExamResults.length !== guidance.examResults.length) {
            guidance.examResults = mergedExamResults;
            await guidance.save();
        }
    }

    return guidance;
};

const getStudentGuidance = async (req, res, next) => {
    try {
        const guidance = await getOrCreateStudentGuidance(req.student._id);

        res.status(200).json({
            success: true,
            data: buildResponse(guidance),
        });
    } catch (error) {
        next(error);
    }
};

const updateStudentInterests = async (req, res, next) => {
    try {
        const guidance = await getOrCreateStudentGuidance(req.student._id);

        guidance.interests = normalizeItems(req.body.interests, (interest) => ({
            name: typeof interest?.name === "string" ? interest.name.trim() : "",
            category: typeof interest?.category === "string" ? interest.category.trim() : "",
        }));

        guidance.aspirations =
            typeof req.body.aspirations === "string"
                ? req.body.aspirations.trim()
                : guidance.aspirations;

        await guidance.save();

        res.status(200).json({
            success: true,
            message: "Interests updated successfully",
            data: buildResponse(guidance),
        });
    } catch (error) {
        next(error);
    }
};

const updateStudentSkills = async (req, res, next) => {
    try {
        const guidance = await getOrCreateStudentGuidance(req.student._id);

        guidance.skills = normalizeItems(req.body.skills, (skill) => ({
            name: typeof skill?.name === "string" ? skill.name.trim() : "",
            category: typeof skill?.category === "string" ? skill.category.trim() : "",
            level: typeof skill?.level === "string" ? skill.level.trim() : "",
        }));

        await guidance.save();

        res.status(200).json({
            success: true,
            message: "Skills updated successfully",
            data: buildResponse(guidance),
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getStudentGuidance,
    updateStudentInterests,
    updateStudentSkills,
};
