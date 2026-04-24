/**
 * Entry point of the backend server.
 * Starts the Express application after connecting to MongoDB.
 */

const path = require("path");
const dotenv = require("dotenv");

const app = require("./app");
const connectDB = require("./config/db");
const {
    logError,
    logSection,
    logStatus,
    logStep,
    logSuccess,
    logWarning,
} = require("./utils/logger");

const PORT = process.env.PORT || 5000;

/**
 * Starts the server after database connection is established.
 */
const startServer = async () => {
    logSection("APPLICATION STARTUP");

    try {
        logStep("Loading environment variables...");

        const envPath = path.resolve(__dirname, "..", ".env");
        const envResult = dotenv.config({ path: envPath, quiet: true });

        if (envResult.error) {
            throw envResult.error;
        }

        const envVariables = Object.keys(envResult.parsed || {}).length;

        logSuccess("Environment loaded", {
            Source: ".env",
            Variables: envVariables,
        });
    } catch (error) {
        logError("Environment loading failed", error);
        process.exit(1);
    }

    const runtimePort = process.env.PORT || PORT;
    const runtimeMode = process.env.NODE_ENV || "development";

    if (!process.env.NODE_ENV) {
        logWarning("NODE_ENV not set", {
            Mode: runtimeMode,
        });
    }

    try {
        logStep("Connecting to MongoDB...");

        const { host } = await connectDB();

        logSuccess("Database connection established", {
            Host: host,
            Status: "Connected",
        });
    } catch (error) {
        logError("Database connection failed", error);
        process.exit(1);
    }

    try {
        logStep("Initializing server...");

        await new Promise((resolve, reject) => {
            let server;

            server = app.listen(runtimePort, () => resolve(server));
            server.on("error", reject);
        });

        logSuccess("Server started", {
            Port: runtimePort,
            Mode: runtimeMode,
        });
        logStatus("RUNNING");
    } catch (error) {
        logError("Server startup failed", error);
        process.exit(1);
    }
};

startServer();
