const Result = require("../../models/Result");
const Student = require("../../models/Student");
const StudentGuidance = require("../../models/student_guidance/StudentGuidance");
const Career = require("../../models/student_guidance/Career");
const StudentCareerSuggestion = require("../../models/student_guidance/StudentCareerSuggestion");
const StudentCareerAnalysis = require("../../models/student_guidance/StudentCareerAnalysis");
const OpenAI = require("openai");

let openAIClient;
const CAREER_SUGGESTION_LIMIT = 6;
const CAREER_ROADMAP_PHASE_LIMIT = 6;

const MARKDOWN_RESPONSE_GUIDELINES = [
    "Return ONLY Markdown.",
    "Use clear section headings with ## and ###.",
    "Break long paragraphs into short, scannable sentences.",
    "Use bullet points or numbered steps for actionable content.",
    "Use **bold** for key terms, priorities, and warnings.",
    "Use emojis sparingly for clarity such as  ✅, 📌.",
    "Preserve meaning and never invent academic facts not present in context.",
    "Tone must be professional, clear, supportive, and student-friendly.",
].join(" ");

const normalizeItems = (items, mapper) => {
    if (!Array.isArray(items)) {
        return [];
    }

    return items
        .map(mapper)
        .filter((item) => item && Object.values(item).every(Boolean));
};

const normalizeText = (value) => (typeof value === "string" ? value.trim() : "");

const toSlug = (value) =>
    normalizeText(String(value || ""))
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

const buildCareerIdentifier = (idCandidate, title, fallbackIndex = 0) => {
    const directId = normalizeText(idCandidate ? String(idCandidate) : "");

    if (directId) {
        return directId;
    }

    const titleSlug = toSlug(title);

    if (titleSlug) {
        return titleSlug;
    }

    return `career-${fallbackIndex + 1}`;
};

const sanitizeStringArray = (items, limit = 8) => {
    if (!Array.isArray(items)) {
        return [];
    }

    return items
        .map((item) => normalizeText(item))
        .filter(Boolean)
        .slice(0, limit);
};

const sanitizeRoadmapSteps = (steps) => {
    if (!Array.isArray(steps)) {
        return [];
    }

    return steps
        .map((step, index) => ({
            phase: normalizeText(step?.phase) || `Phase ${index + 1}`,
            timeline: normalizeText(step?.timeline),
            objective:
                normalizeText(step?.objective) || normalizeText(step?.outcome),
            actions: sanitizeStringArray(step?.actions, 5),
            milestone: normalizeText(step?.milestone),
        }))
        .filter((step) => step.phase && step.objective)
        .slice(0, CAREER_ROADMAP_PHASE_LIMIT);
};

const buildCareerSuggestions = async (guidance, examResults) => {
    const interestTags = guidance.interests.map((interest) => interest.name);
    const skillTags = guidance.skills.flatMap((skill) => [skill.name, skill.category]);
    const subjectTags = examResults.flatMap((semester) =>
        semester.subjects.map((subject) => subject.subject)
    );
    const tags = new Set([...interestTags, ...skillTags, ...subjectTags]);

    // Fetch active careers from database
    const careers = await Career.find({ isActive: true }).lean();

    return careers.map((career, index) => ({
        id: buildCareerIdentifier(career?._id, career?.title, index),
        title: normalizeText(career?.title),
        summary: normalizeText(career?.summary),
        nextStep: normalizeText(career?.nextStep),
        matchScore: Number(career?.matchScore),
        matchedAreas: Array.isArray(career?.matchTags)
            ? career.matchTags.filter((tag) => tags.has(tag)).slice(0, 4)
            : [],
    }));
};

const extractJsonFromText = (text) => {
    if (typeof text !== "string") {
        return null;
    }

    const trimmed = text.trim();
    const fencedMatch = trimmed.match(/```json\s*([\s\S]*?)```/i);
    const candidate = fencedMatch ? fencedMatch[1].trim() : trimmed;

    try {
        return JSON.parse(candidate);
    } catch {
        return null;
    }
};

const sanitizeAISuggestions = (items) => {
    if (!Array.isArray(items)) {
        return [];
    }

    return items
        .map((item, index) => ({
            id: buildCareerIdentifier(item?.id, item?.title, index),
            title: normalizeText(item?.title),
            summary: normalizeText(item?.summary),
            nextStep: normalizeText(item?.nextStep),
            matchScore: Number(item?.matchScore),
            matchedAreas: sanitizeStringArray(item?.matchedAreas, 5),
        }))
        .filter(
            (item) =>
                item.id &&
                item.title &&
                item.summary &&
                item.nextStep &&
                Number.isFinite(item.matchScore)
        )
        .map((item) => ({
            ...item,
            matchScore: Math.max(0, Math.min(100, Math.round(item.matchScore))),
        }))
        .slice(0, CAREER_SUGGESTION_LIMIT);
};

const generateAICareerSuggestions = async (context, catalogCareers) => {
    const client = getOpenAIClient();

    const response = await client.responses.create({
        model: process.env.OPENAI_MODEL || "gpt-5",
        reasoning: { effort: "medium" },
        input: [
            {
                role: "developer",
                content:
                    "You generate personalized internship career suggestions for one student. Return only strict JSON with this shape: {\"suggestions\":[{\"id\":string,\"title\":string,\"summary\":string,\"nextStep\":string,\"matchScore\":number,\"matchedAreas\":string[]}]}. Use id values exactly from the provided career catalog. No markdown.",
            },
            {
                role: "developer",
                content: `Career catalog (JSON): ${JSON.stringify(catalogCareers)}`,
            },
            {
                role: "developer",
                content: `Student context (JSON): ${JSON.stringify(context)}`,
            },
            {
                role: "user",
                content: `Generate ${CAREER_SUGGESTION_LIMIT} career suggestions ranked by fit. Use only relevant data from context and catalog.`,
            },
        ],
    });

    const payload = extractJsonFromText(response.output_text || "");
    return sanitizeAISuggestions(payload?.suggestions);
};

const sanitizeAICareerDetail = (payload, selectedSuggestion) => {
    if (!payload || typeof payload !== "object") {
        return null;
    }

    const roadmap = sanitizeRoadmapSteps(payload.roadmap);
    const comprehensiveDescription = normalizeText(payload.comprehensiveDescription);
    const nextStep =
        normalizeText(payload.nextStep) || normalizeText(selectedSuggestion?.nextStep);

    const selectedMatchScore = Number(selectedSuggestion?.matchScore);

    const normalizedDetail = {
        id: buildCareerIdentifier(selectedSuggestion?.id, selectedSuggestion?.title),
        title: normalizeText(selectedSuggestion?.title),
        summary: normalizeText(selectedSuggestion?.summary),
        matchScore: Number.isFinite(selectedMatchScore)
            ? Math.max(0, Math.min(100, Math.round(selectedMatchScore)))
            : 0,
        matchedAreas: sanitizeStringArray(selectedSuggestion?.matchedAreas, 6),
        comprehensiveDescription,
        strengthsToLeverage: sanitizeStringArray(payload.strengthsToLeverage, 6),
        skillGaps: sanitizeStringArray(payload.skillGaps, 6),
        guidelines: sanitizeStringArray(payload.guidelines, 8),
        roadmap,
        nextStep,
        confidenceNote: normalizeText(payload.confidenceNote),
    };

    if (
        !normalizedDetail.title ||
        !normalizedDetail.comprehensiveDescription ||
        !normalizedDetail.guidelines.length ||
        !normalizedDetail.roadmap.length ||
        !normalizedDetail.nextStep
    ) {
        return null;
    }

    return normalizedDetail;
};

const buildFallbackCareerDetail = (selectedSuggestion, context) => {
    const interestSignals = sanitizeStringArray(
        context?.studentGuidance?.interests?.map((item) => item?.name),
        3
    );
    const skillSignals = sanitizeStringArray(
        context?.studentGuidance?.skills?.map((item) => item?.name),
        3
    );
    const matchedAreas = sanitizeStringArray(selectedSuggestion?.matchedAreas, 6);

    const strengthsToLeverage =
        sanitizeStringArray(
            [...interestSignals, ...skillSignals, ...matchedAreas],
            6
        ) || [];

    return {
        id: buildCareerIdentifier(selectedSuggestion?.id, selectedSuggestion?.title),
        title: normalizeText(selectedSuggestion?.title),
        summary: normalizeText(selectedSuggestion?.summary),
        matchScore: Number.isFinite(Number(selectedSuggestion?.matchScore))
            ? Math.max(0, Math.min(100, Math.round(Number(selectedSuggestion?.matchScore))))
            : 0,
        matchedAreas,
        comprehensiveDescription:
            `${normalizeText(selectedSuggestion?.title)} aligns with your profile based on your selected interests, ` +
            "skills, and academic progress. Follow this guided plan to build practical capability, " +
            "close key gaps, and create portfolio evidence for internship applications.",
        strengthsToLeverage:
            strengthsToLeverage.length > 0
                ? strengthsToLeverage
                : [
                      "Consistent learning habits",
                      "Structured project execution",
                      "Clear communication of technical decisions",
                  ],
        skillGaps: [
            "Real-world project depth with measurable outcomes",
            "Interview-focused problem solving under time constraints",
            "Documentation and presentation of implementation decisions",
        ],
        guidelines: [
            "Set one measurable weekly objective and track completion status.",
            "Translate each concept into a practical mini-project before moving forward.",
            "Request feedback from mentors or peers every two weeks and apply improvements.",
            "Document each project using clear architecture notes, trade-offs, and results.",
            "Align portfolio work with internship role descriptions and assessment criteria.",
        ],
        roadmap: [
            {
                phase: "Phase 1: Direction & Baseline",
                timeline: "Week 1",
                objective:
                    "Define role targets, assess current level, and prioritize required competencies.",
                actions: [
                    "Review internship job descriptions for this role and list required skills.",
                    "Run a personal skill audit and identify top three improvement priorities.",
                    "Create a weekly study and build schedule with milestones.",
                ],
                milestone: "Approved 8-10 week learning plan with clear outcomes.",
            },
            {
                phase: "Phase 2: Core Skill Build",
                timeline: "Weeks 2-3",
                objective:
                    "Strengthen technical fundamentals and complete focused practice tasks.",
                actions: [
                    "Study core concepts daily and complete short implementation exercises.",
                    "Build two feature-focused mini projects to verify understanding.",
                    "Capture common mistakes and corrective patterns in learning notes.",
                ],
                milestone: "Two working mini projects demonstrating core competencies.",
            },
            {
                phase: "Phase 3: Guided Project Sprint",
                timeline: "Weeks 4-5",
                objective:
                    "Build one portfolio-ready project with realistic workflow and delivery standards.",
                actions: [
                    "Define project scope, user stories, and implementation plan.",
                    "Ship features in weekly increments and maintain quality checks.",
                    "Record design decisions and technical trade-offs.",
                ],
                milestone: "Portfolio project v1 delivered with documentation.",
            },
            {
                phase: "Phase 4: Industry Readiness",
                timeline: "Weeks 6-7",
                objective:
                    "Improve reliability, testing discipline, and communication quality.",
                actions: [
                    "Add validation and test critical scenarios where possible.",
                    "Refine UX and performance using mentor or peer feedback.",
                    "Prepare a concise project walkthrough and technical summary.",
                ],
                milestone: "Production-quality project iteration with polished presentation.",
            },
            {
                phase: "Phase 5: Interview & Application Sprint",
                timeline: "Weeks 8-9",
                objective:
                    "Translate project evidence into interview and application readiness.",
                actions: [
                    "Build role-specific resume bullets with measurable impact statements.",
                    "Practice behavioral and technical interview questions.",
                    "Prepare STAR stories from project decisions and outcomes.",
                ],
                milestone:
                    "Application package completed with portfolio, resume, and interview narratives.",
            },
            {
                phase: "Phase 6: Launch & Iterate",
                timeline: "Week 10",
                objective:
                    "Apply to targeted internships and continuously refine based on outcomes.",
                actions: [
                    "Submit applications in focused batches and track responses.",
                    "Review rejection/feedback signals and update weak areas quickly.",
                    "Set the next 30-day upskilling plan while interviewing.",
                ],
                milestone: "Active internship pipeline with a repeatable improvement loop.",
            },
        ],
        nextStep:
            normalizeText(selectedSuggestion?.nextStep) ||
            "Start Phase 1 today by defining your target role checklist and weekly plan.",
        confidenceNote:
            "AI detail generation was unavailable, so this roadmap was auto-generated from your saved profile context.",
    };
};

const generateAICareerDetail = async (
    context,
    selectedSuggestion,
    allSuggestions = []
) => {
    const client = getOpenAIClient();

    const alternatives = sanitizeAISuggestions(allSuggestions)
        .filter((item) => item.id !== selectedSuggestion.id)
        .slice(0, 3)
        .map((item) => ({
            id: item.id,
            title: item.title,
            summary: item.summary,
            matchScore: item.matchScore,
        }));

    const response = await client.responses.create({
        model: process.env.OPENAI_MODEL || "gpt-5",
        reasoning: { effort: "medium" },
        input: [
            {
                role: "developer",
                content:
                    "You generate a complete personalized career analysis and guided roadmap for one student. Return only strict JSON with this shape: {\"comprehensiveDescription\":string,\"strengthsToLeverage\":string[],\"skillGaps\":string[],\"guidelines\":string[],\"roadmap\":[{\"phase\":string,\"timeline\":string,\"objective\":string,\"actions\":string[],\"milestone\":string}],\"nextStep\":string,\"confidenceNote\":string}. No markdown.",
            },
            {
                role: "developer",
                content:
                    "Use only the student context provided. Do not invent grades, modules, or profile facts.",
            },
            {
                role: "developer",
                content: `Student academic context (JSON): ${JSON.stringify(context)}`,
            },
            {
                role: "developer",
                content: `Selected career suggestion (JSON): ${JSON.stringify(selectedSuggestion)}`,
            },
            {
                role: "developer",
                content: `Alternative career suggestions (JSON): ${JSON.stringify(alternatives)}`,
            },
            {
                role: "user",
                content:
                    "Generate a full analysis with a complete guided roadmap for the selected career suggestion.",
            },
        ],
    });

    const payload = extractJsonFromText(response.output_text || "");
    return sanitizeAICareerDetail(payload, selectedSuggestion);
};

const getStoredCareerAnalysis = async (studentId, careerId) => {
    return StudentCareerAnalysis.findOne({
        student: studentId,
        careerId,
    }).lean();
};

const saveCareerAnalysis = async ({ studentId, careerId, report, source }) => {
    if (!report || typeof report !== "object") {
        return null;
    }

    return StudentCareerAnalysis.findOneAndUpdate(
        {
            student: studentId,
            careerId,
        },
        {
            student: studentId,
            careerId,
            report,
            source: source === "fallback" ? "fallback" : "ai",
            generatedAt: new Date(),
        },
        {
            upsert: true,
            new: true,
            setDefaultsOnInsert: true,
        }
    );
};

const getStoredCareerSuggestions = async (studentId) => {
    const record = await StudentCareerSuggestion.findOne({ student: studentId }).lean();
    return sanitizeAISuggestions(record?.suggestions || []);
};

const refreshCareerSuggestionsForStudent = async (studentId, guidance, examResults) => {
    const [context, catalogCareersRaw] = await Promise.all([
        buildAcademicContext(studentId),
        Career.find({ isActive: true })
            .select("title summary nextStep matchTags matchScore")
            .lean(),
    ]);

    const catalogCareers = catalogCareersRaw.map((career, index) => ({
        id: buildCareerIdentifier(career?._id, career?.title, index),
        title: normalizeText(career?.title),
        summary: normalizeText(career?.summary),
        nextStep: normalizeText(career?.nextStep),
        matchTags: sanitizeStringArray(career?.matchTags, 10),
        matchScore: Number(career?.matchScore),
    }));

    let aiSuggestions = [];

    try {
        aiSuggestions = await generateAICareerSuggestions(context, catalogCareers);
    } catch {
        aiSuggestions = [];
    }

    const fallbackSuggestions = await buildCareerSuggestions(guidance, examResults);
    const nextSuggestions = sanitizeAISuggestions(
        aiSuggestions.length ? aiSuggestions : fallbackSuggestions
    );

    await StudentCareerSuggestion.findOneAndUpdate(
        { student: studentId },
        {
            student: studentId,
            suggestions: nextSuggestions,
            generatedAt: new Date(),
            source: aiSuggestions.length ? "ai" : "fallback",
        },
        {
            upsert: true,
            new: true,
            setDefaultsOnInsert: true,
        }
    );

    return nextSuggestions;
};

const buildResponse = async (guidance, examResults, careerSuggestions = []) => ({
    examResults,
    interests: guidance.interests,
    skills: guidance.skills,
    aspirations: guidance.aspirations,
    careerSuggestions,
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
            interests: [],
            skills: [],
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
        let careerSuggestions = await getStoredCareerSuggestions(req.student._id);

        if (!careerSuggestions.length) {
            careerSuggestions = await refreshCareerSuggestionsForStudent(
                req.student._id,
                guidance,
                examResults
            );
        }

        const responseData = await buildResponse(guidance, examResults, careerSuggestions);

        res.status(200).json({
            success: true,
            data: responseData,
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
        const careerSuggestions = await getStoredCareerSuggestions(req.student._id);
        const responseData = await buildResponse(guidance, examResults, careerSuggestions);

        res.status(200).json({
            success: true,
            message: "Interests updated successfully",
            data: responseData,
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
        const careerSuggestions = await getStoredCareerSuggestions(req.student._id);
        const responseData = await buildResponse(guidance, examResults, careerSuggestions);

        res.status(200).json({
            success: true,
            message: "Skills updated successfully",
            data: responseData,
        });
    } catch (error) {
        next(error);
    }
};

const refreshCareerSuggestions = async (req, res, next) => {
    try {
        const guidance = await getOrCreateStudentGuidance(req.student._id);
        const examResults = await getStudentExamResults(req.student._id);
        const careerSuggestions = await refreshCareerSuggestionsForStudent(
            req.student._id,
            guidance,
            examResults
        );
        const responseData = await buildResponse(guidance, examResults, careerSuggestions);

        res.status(200).json({
            success: true,
            message: "Career suggestions refreshed successfully",
            data: responseData,
        });
    } catch (error) {
        next(error);
    }
};

const getCareerAnalysis = async (req, res, next) => {
    try {
        const requestedCareerId = normalizeText(req.params?.careerId);
        const refreshQuery = normalizeText(req.query?.refresh).toLowerCase();
        const forceRefresh = ["1", "true", "yes", "refresh", "regenerate"].includes(
            refreshQuery
        );

        if (!requestedCareerId) {
            return res.status(400).json({
                success: false,
                message: "Career id is required",
            });
        }

        const guidance = await getOrCreateStudentGuidance(req.student._id);
        const examResults = await getStudentExamResults(req.student._id);
        let careerSuggestions = await getStoredCareerSuggestions(req.student._id);

        if (!careerSuggestions.length) {
            careerSuggestions = await refreshCareerSuggestionsForStudent(
                req.student._id,
                guidance,
                examResults
            );
        }

        const selectedSuggestion =
            careerSuggestions.find((item) => item.id === requestedCareerId) ||
            careerSuggestions.find(
                (item) =>
                    toSlug(item.title) === requestedCareerId ||
                    buildCareerIdentifier(item.id, item.title) === requestedCareerId
            );

        if (!selectedSuggestion) {
            return res.status(404).json({
                success: false,
                message: "Career guide not found for this suggestion",
            });
        }

        if (!forceRefresh) {
            const cachedAnalysis = await getStoredCareerAnalysis(
                req.student._id,
                selectedSuggestion.id
            );

            const cachedReport = sanitizeAICareerDetail(
                cachedAnalysis?.report,
                selectedSuggestion
            );

            if (cachedReport) {
                return res.status(200).json({
                    success: true,
                    data: cachedReport,
                    meta: {
                        source: cachedAnalysis?.source || "ai",
                        cached: true,
                        generatedAt: cachedAnalysis?.generatedAt || null,
                    },
                });
            }
        }

        const context = await buildAcademicContext(req.student._id);

        let aiDetail = null;

        try {
            aiDetail = await generateAICareerDetail(
                context,
                selectedSuggestion,
                careerSuggestions
            );
        } catch {
            aiDetail = null;
        }

        const responseData =
            aiDetail || buildFallbackCareerDetail(selectedSuggestion, context);

        const analysisSource = aiDetail ? "ai" : "fallback";

        await saveCareerAnalysis({
            studentId: req.student._id,
            careerId: selectedSuggestion.id,
            report: responseData,
            source: analysisSource,
        });

        return res.status(200).json({
            success: true,
            data: responseData,
            meta: {
                source: analysisSource,
                cached: false,
                generatedAt: new Date(),
            },
        });
    } catch (error) {
        return next(error);
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
                `You are Ask InternConnect, an academic and career assistant for internship readiness. Use only the student data provided in context. Do not invent grades, modules, or profile details. If data is missing, state that and suggest next steps. ${MARKDOWN_RESPONSE_GUIDELINES}`,
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
    getCareerAnalysis,
    getStudentGuidance,
    refreshCareerSuggestions,
    updateStudentInterests,
    updateStudentSkills,
};
