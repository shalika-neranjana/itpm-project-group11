const StudentJourney = require("../../models/student_guidance/StudentJourney");
const OpenAI = require("openai");

let openAIClient;

const getOpenAIClient = () => {
    if (!process.env.OPENAI_API_KEY) {
        throw new Error("OPENAI_API_KEY is not configured on the server environment");
    }

    if (!openAIClient) {
        openAIClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }

    return openAIClient;
};

const extractJsonFromText = (text) => {
    if (typeof text !== "string") return null;
    const trimmed = text.trim();
    const fencedMatch = trimmed.match(/```json\s*([\s\S]*?)```/i);
    const candidate = fencedMatch ? fencedMatch[1].trim() : trimmed;
    try {
        return JSON.parse(candidate);
    } catch {
        return null;
    }
};

exports.getAllJourneys = async (req, res, next) => {
    try {
        const journeys = await StudentJourney.find({ student: req.student._id }).sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            data: journeys,
        });
    } catch (error) {
        next(error);
    }
};

exports.getJourneyById = async (req, res, next) => {
    try {
        const journey = await StudentJourney.findOne({
            _id: req.params.id,
            student: req.student._id,
        });

        if (!journey) {
            return res.status(404).json({
                success: false,
                message: "Journey not found",
            });
        }

        res.status(200).json({
            success: true,
            data: journey,
        });
    } catch (error) {
        next(error);
    }
};

exports.createJourney = async (req, res, next) => {
    try {
        const { title, description, steps } = req.body;
        const journey = await StudentJourney.create({
            student: req.student._id,
            title,
            description,
            steps,
        });

        res.status(201).json({
            success: true,
            data: journey,
        });
    } catch (error) {
        next(error);
    }
};

exports.updateJourney = async (req, res, next) => {
    try {
        const { title, description, steps } = req.body;
        const journey = await StudentJourney.findOneAndUpdate(
            { _id: req.params.id, student: req.student._id },
            { title, description, steps },
            { new: true, runValidators: true }
        );

        if (!journey) {
            return res.status(404).json({
                success: false,
                message: "Journey not found",
            });
        }

        res.status(200).json({
            success: true,
            data: journey,
        });
    } catch (error) {
        next(error);
    }
};

exports.deleteJourney = async (req, res, next) => {
    try {
        const journey = await StudentJourney.findOneAndDelete({
            _id: req.params.id,
            student: req.student._id,
        });

        if (!journey) {
            return res.status(404).json({
                success: false,
                message: "Journey not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Journey deleted successfully",
        });
    } catch (error) {
        next(error);
    }
};

exports.generateAISteps = async (req, res, next) => {
    try {
        const { title, description } = req.body;
        const client = getOpenAIClient();

        const response = await client.responses.create({
            model: process.env.OPENAI_MODEL || "gpt-5",
            reasoning: { effort: "medium" },
            input: [
                {
                    role: "developer",
                    content: "You are a career advisor. Generate a structured roadmap for a student journey. Return ONLY strict JSON with this shape: {\"steps\":[{\"title\":string,\"timeAllocation\":string,\"subSteps\":[{\"title\":string,\"timeAllocation\":string}]}]}. No markdown."
                },
                {
                    role: "user",
                    content: `Title: ${title}\nDescription: ${description}`
                }
            ]
        });

        const payload = extractJsonFromText(response.output_text || "");

        if (!payload || !payload.steps) {
            throw new Error("Failed to parse AI response");
        }

        res.status(200).json({
            success: true,
            data: payload.steps,
        });
    } catch (error) {
        console.error("AI Generation Error:", error);
        
        // Fallback: Generate a generic roadmap if AI fails
        const fallbackSteps = [
            {
                title: "Research & Planning",
                timeAllocation: "1 week",
                subSteps: [
                    { title: "Define specific goals", timeAllocation: "2 days" },
                    { title: "Identify required resources", timeAllocation: "3 days" }
                ]
            },
            {
                title: "Skill Acquisition",
                timeAllocation: "4 weeks",
                subSteps: [
                    { title: "Online courses & tutorials", timeAllocation: "2 weeks" },
                    { title: "Practical exercises", timeAllocation: "2 weeks" }
                ]
            },
            {
                title: "Project Development",
                timeAllocation: "4 weeks",
                subSteps: [
                    { title: "MVP implementation", timeAllocation: "2 weeks" },
                    { title: "Refining & testing", timeAllocation: "2 weeks" }
                ]
            },
            {
                title: "Review & Iteration",
                timeAllocation: "1 week",
                subSteps: [
                    { title: "Get feedback", timeAllocation: "3 days" },
                    { title: "Final adjustments", timeAllocation: "4 days" }
                ]
            }
        ];

        res.status(200).json({
            success: true,
            data: fallbackSteps,
            message: "AI generation unavailable, provided a default template.",
        });
    }
};

exports.toggleStepCompletion = async (req, res, next) => {
    try {
        const { journeyId, stepId, subStepId, completed } = req.body;
        const journey = await StudentJourney.findOne({ _id: journeyId, student: req.student._id });

        if (!journey) {
            return res.status(404).json({ success: false, message: "Journey not found" });
        }

        const step = journey.steps.id(stepId);
        if (!step) return res.status(404).json({ success: false, message: "Step not found" });

        if (subStepId) {
            const subStep = step.subSteps.id(subStepId);
            if (!subStep) return res.status(404).json({ success: false, message: "Sub-step not found" });
            subStep.completed = completed;
            
            // Auto-complete parent step if all sub-steps are completed? 
            // Or just leave it as is. Usually, parent is completed if all children are.
            const allSubCompleted = step.subSteps.every(s => s.completed);
            step.completed = allSubCompleted;
        } else {
            step.completed = completed;
            // If completing a parent, should we complete all sub-steps?
            if (completed) {
                step.subSteps.forEach(s => s.completed = true);
            } else {
                step.subSteps.forEach(s => s.completed = false);
            }
        }

        await journey.save();
        res.status(200).json({ success: true, data: journey });
    } catch (error) {
        next(error);
    }
};
