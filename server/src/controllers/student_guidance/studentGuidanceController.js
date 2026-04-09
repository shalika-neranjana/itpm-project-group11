const Result = require("../../models/Result");
const Student = require("../../models/Student");
const StudentGuidance = require("../../models/student_guidance/StudentGuidance");
const OpenAI = require("openai");

let openAIClient;

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

const getOpenAIClient = () => {
    if (!process.env.OPENAI_API_KEY) {
        throw new Error("OPENAI_API_KEY is not configured on the server environment");
    }

    if (!openAIClient) {
        openAIClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }

    return openAIClient;
};

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

const normalizeChatHistory = (history) => {
    if (!Array.isArray(history)) {
        return [];
    }

    return history
        .map((item) => ({
            role: item?.role === "assistant" ? "assistant" : "user",
            text: typeof item?.text === "string" ? item.text.trim() : "",
        }))
        .filter((item) => item.text)
        .slice(-10);
};

const buildAcademicContext = async (studentId) => {
    const [studentProfile, guidance, examResults] = await Promise.all([
        Student.findById(studentId)
            .select("firstName lastName studentId email university faculty specialization gpa skills")
            .lean(),
        getOrCreateStudentGuidance(studentId),
        getStudentExamResults(studentId),
    ]);

    const allSubjects = examResults.flatMap((semesterResult) => semesterResult.subjects);
    const averageCa =
        allSubjects.length > 0
            ? Number(
                  (
                      allSubjects.reduce(
                          (total, subject) => total + Number(subject.caPercentage || 0),
                          0
                      ) / allSubjects.length
                  ).toFixed(2)
              )
            : null;

    return {
        student: {
            name: `${studentProfile?.firstName || ""} ${studentProfile?.lastName || ""}`.trim(),
            studentId: studentProfile?.studentId || "",
            email: studentProfile?.email || "",
            university: studentProfile?.university || "",
            faculty: studentProfile?.faculty || "",
            specialization: studentProfile?.specialization || "",
            gpa: studentProfile?.gpa ?? null,
            studentSkills: Array.isArray(studentProfile?.skills) ? studentProfile.skills : [],
        },
        studentGuidance: {
            aspirations: guidance?.aspirations || "",
            interests: Array.isArray(guidance?.interests) ? guidance.interests : [],
            skills: Array.isArray(guidance?.skills) ? guidance.skills : [],
        },
        examResults,
        summary: {
            totalSemesters: examResults.length,
            totalSubjects: allSubjects.length,
            averageCaPercentage: averageCa,
        },
    };
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

const askInternConnect = async (req, res, next) => {
    let streamClosed = false;

    const sendEvent = (event, payload) => {
        if (streamClosed) {
            return;
        }

        res.write(`event: ${event}\n`);
        res.write(`data: ${JSON.stringify(payload)}\n\n`);
    };

    const closeStream = () => {
        if (!streamClosed) {
            streamClosed = true;
            res.end();
        }
    };

    try {
        const message = typeof req.body?.message === "string" ? req.body.message.trim() : "";

        if (!message) {
            return res.status(400).json({
                success: false,
                message: "Message is required",
            });
        }

        res.status(200);
        res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
        res.setHeader("Cache-Control", "no-cache, no-transform");
        res.setHeader("Connection", "keep-alive");
        res.setHeader("X-Accel-Buffering", "no");
        res.flushHeaders?.();

        req.on("close", () => {
            streamClosed = true;
        });

        sendEvent("status", { message: "InternConnect is thinking..." });

        const history = normalizeChatHistory(req.body?.history);
        const context = await buildAcademicContext(req.student._id);

        sendEvent("status", { message: "InternConnect is analysing..." });

        const client = getOpenAIClient();
        const stream = await client.responses.create({
            model: process.env.OPENAI_MODEL || "gpt-5",
            reasoning: { effort: "medium" },
            stream: true,
            instructions:
                "You are Ask InternConnect, an academic and career assistant for internship readiness. Use only the student data provided in context. Do not invent grades, modules, or profile details. If data is missing, state that and suggest next steps. Keep answers practical, supportive, and concise.",
            input: [
                {
                    role: "developer",
                    content: `Student academic context (JSON): ${JSON.stringify(context)}`,
                },
                ...history.map((item) => ({ role: item.role, content: item.text })),
                { role: "user", content: message },
            ],
        });

        sendEvent("status", { message: "InternConnect is generating response..." });

        let reply = "";

        for await (const event of stream) {
            if (streamClosed) {
                break;
            }

            if (event.type === "response.output_text.delta" && typeof event.delta === "string") {
                reply += event.delta;
                sendEvent("chunk", { delta: event.delta });
            }

            if (event.type === "response.error") {
                throw new Error(event.error?.message || "OpenAI streaming error");
            }
        }

        if (!reply.trim()) {
            sendEvent("error", { message: "AI service returned an empty response" });
            return closeStream();
        }

        sendEvent("done", {
            reply,
            completed: true,
        });

        return closeStream();
    } catch (error) {
        if (res.headersSent) {
            sendEvent("error", {
                message: error.message || "Streaming failed. Please try again.",
            });
            return closeStream();
        }

        return next(error);
    }
};

module.exports = {
    askInternConnect,
    getStudentGuidance,
    updateStudentInterests,
    updateStudentSkills,
};
