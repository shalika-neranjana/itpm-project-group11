const Result = require("../../models/Result");
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

const CAREER_LIBRARY = [
    {
        title: "Web Developer",
        matchTags: ["Software Engineering", "User Experience Design", "JavaScript", "React"],
        summary: "Build responsive, user-focused web experiences with modern frontend and backend tooling.",
        nextStep: "Build and deploy one full web app with authentication, API integration, and accessibility checks.",
        fixedScore: 80,
    },
    {
        title: "Mobile Apps Developer",
        matchTags: ["Software Engineering", "JavaScript", "React", "Communication Skills"],
        summary: "Create mobile-first applications with smooth user interactions and reliable performance.",
        nextStep: "Create a mobile app prototype and implement core screens with navigation and state handling.",
        fixedScore: 15,
    },
    {
        title: "Desktop App Developer",
        matchTags: ["Software Engineering", "Programming", "Database"],
        summary: "Develop robust desktop applications with stable architecture and local/system integrations.",
        nextStep: "Build a small desktop utility app with file handling and structured error management.",
        fixedScore: 5,
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

const buildCareerSuggestions = (guidance, examResults) => {
    const interestTags = guidance.interests.map((interest) => interest.name);
    const skillTags = guidance.skills.flatMap((skill) => [skill.name, skill.category]);
    const subjectTags = examResults.flatMap((semester) =>
        semester.subjects.map((subject) => subject.subject)
    );
    const tags = new Set([...interestTags, ...skillTags, ...subjectTags]);

    return CAREER_LIBRARY.map((career) => ({
        title: career.title,
        summary: career.summary,
        nextStep: career.nextStep,
        matchScore: career.fixedScore,
        matchedAreas: career.matchTags.filter((tag) => tags.has(tag)).slice(0, 4),
    }));
};

const buildResponse = (guidance, examResults) => ({
    examResults,
    interests: guidance.interests,
    skills: guidance.skills,
    aspirations: guidance.aspirations,
    careerSuggestions: buildCareerSuggestions(guidance, examResults),
});

const sortSubjects = (left, right) =>
    left.subjectCode.localeCompare(right.subjectCode) || left.subject.localeCompare(right.subject);

const getStudentExamResults = async (studentId) => {
    const results = await Result.find({ student: studentId })
        .populate({
            path: "module",
            select: "module_code module_name year semester credit_points",
        })
        .lean();

    const semesterMap = new Map();

    for (const result of results) {
        if (!result.module) {
            continue;
        }

        const year = Number(result.module.year);
        const semester = Number(result.module.semester);
        const key = `${year}-${semester}`;

        if (!semesterMap.has(key)) {
            semesterMap.set(key, {
                year,
                semester,
                subjects: [],
            });
        }

        semesterMap.get(key).subjects.push({
            resultId: String(result._id),
            subjectCode: result.module.module_code,
            subject: result.module.module_name,
            credits: result.module.credit_points,
            caPercentage: result.caMarks,
            grade: result.grade,
        });
    }

    return [...semesterMap.values()]
        .map((semesterResult) => ({
            ...semesterResult,
            subjects: semesterResult.subjects.sort(sortSubjects),
        }))
        .sort((left, right) => left.year - right.year || left.semester - right.semester);
};

const getOrCreateStudentGuidance = async (studentId) => {
    let guidance = await StudentGuidance.findOne({ student: studentId });

    if (!guidance) {
        guidance = await StudentGuidance.create({
            student: studentId,
            interests: DEFAULT_INTERESTS,
            skills: DEFAULT_SKILLS,
            aspirations: "I want to build a strong technical foundation and choose a career path that fits my strengths.",
        });
    }

    return guidance;
};

const getStudentGuidance = async (req, res, next) => {
    try {
        const guidance = await getOrCreateStudentGuidance(req.student._id);
        const examResults = await getStudentExamResults(req.student._id);

        res.status(200).json({
            success: true,
            data: buildResponse(guidance, examResults),
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
        const examResults = await getStudentExamResults(req.student._id);

        res.status(200).json({
            success: true,
            message: "Interests updated successfully",
            data: buildResponse(guidance, examResults),
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
        const examResults = await getStudentExamResults(req.student._id);

        res.status(200).json({
            success: true,
            message: "Skills updated successfully",
            data: buildResponse(guidance, examResults),
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
