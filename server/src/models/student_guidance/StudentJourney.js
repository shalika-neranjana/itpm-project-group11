const mongoose = require("mongoose");

const SubStepSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    timeAllocation: {
        type: String,
        trim: true,
    },
    completed: {
        type: Boolean,
        default: false,
    },
    deadline: {
        type: Date,
    },
});

const StepSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    timeAllocation: {
        type: String,
        trim: true,
    },
    completed: {
        type: Boolean,
        default: false,
    },
    deadline: {
        type: Date,
    },
    subSteps: [SubStepSchema],
});

const StudentJourneySchema = new mongoose.Schema(
    {
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Student",
            required: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },
        steps: [StepSchema],
    },
    {
        timestamps: true,
    }
);

// Calculate overall progress virtual
StudentJourneySchema.virtual("progress").get(function () {
    if (!this.steps || this.steps.length === 0) return 0;

    let totalPoints = 0;
    let completedPoints = 0;

    this.steps.forEach((step) => {
        // A step has sub-steps or is a leaf
        if (step.subSteps && step.subSteps.length > 0) {
            step.subSteps.forEach((sub) => {
                totalPoints += 1;
                if (sub.completed) completedPoints += 1;
            });
        } else {
            totalPoints += 1;
            if (step.completed) completedPoints += 1;
        }
    });

    return totalPoints === 0 ? 0 : Math.round((completedPoints / totalPoints) * 100);
});

StudentJourneySchema.set("toJSON", { virtuals: true });
StudentJourneySchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("StudentJourney", StudentJourneySchema);
