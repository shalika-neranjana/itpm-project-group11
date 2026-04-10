const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const Career = require("../models/student_guidance/Career");

const DEFAULT_CAREERS = [
    {
        title: "Web Developer",
        matchTags: ["Software Engineering", "User Experience Design", "JavaScript", "React"],
        summary: "Build responsive, user-focused web experiences with modern frontend and backend tooling.",
        nextStep: "Build and deploy one full web app with authentication, API integration, and accessibility checks.",
        matchScore: 80,
        isActive: true,
    },
    {
        title: "Mobile Apps Developer",
        matchTags: ["Software Engineering", "JavaScript", "React", "Communication Skills"],
        summary: "Create mobile-first applications with smooth user interactions and reliable performance.",
        nextStep: "Create a mobile app prototype and implement core screens with navigation and state handling.",
        matchScore: 75,
        isActive: true,
    },
    {
        title: "Desktop App Developer",
        matchTags: ["Software Engineering", "Programming", "Database"],
        summary: "Develop robust desktop applications with stable architecture and local/system integrations.",
        nextStep: "Build a small desktop utility app with file handling and structured error management.",
        matchScore: 70,
        isActive: true,
    },
    {
        title: "Backend Developer",
        matchTags: ["Software Engineering", "Database", "SQL", "APIs"],
        summary: "Design and maintain server-side systems that power applications with scalable architectures.",
        nextStep: "Build a REST API with proper authentication, validation, and error handling.",
        matchScore: 85,
        isActive: true,
    },
    {
        title: "Data Analyst",
        matchTags: ["Data Analysis", "Analytics", "SQL", "Programming"],
        summary: "Extract insights from data to drive business decisions and optimize processes.",
        nextStep: "Create a data analysis project with visualization and actionable recommendations.",
        matchScore: 78,
        isActive: true,
    },
    {
        title: "UI/UX Designer",
        matchTags: ["User Experience Design", "Design", "Communication Skills"],
        summary: "Create intuitive and beautiful user interfaces that solve real problems.",
        nextStep: "Design a complete user flow with wireframes, prototypes, and user testing insights.",
        matchScore: 72,
        isActive: true,
    },
];

const seedCareers = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/internconnect");
        console.log("Connected to MongoDB");

        // Clear existing careers (optional)
        await Career.deleteMany({});
        console.log("Cleared existing careers");

        // Insert default careers
        const inserted = await Career.insertMany(DEFAULT_CAREERS);
        console.log(`✅ Successfully seeded ${inserted.length} careers`);

        process.exit(0);
    } catch (error) {
        console.error("Error seeding careers:", error);
        process.exit(1);
    }
};

seedCareers();
