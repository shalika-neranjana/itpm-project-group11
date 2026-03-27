const chalk = require("chalk");

const DIVIDER = "────────────────────────────────────────────────────────";

const getTimestamp = () => {
    const date = new Date();
    const pad = (value) => String(value).padStart(2, "0");

    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

const withTimestamp = (message) => `[${getTimestamp()}]  ${message}`;

const formatDetails = (detailsObject = {}) => {
    const entries = Object.entries(detailsObject);

    if (entries.length === 0) {
        return [];
    }

    const longestKey = Math.max(...entries.map(([key]) => key.length));

    return entries.map(([key, value], index) => {
        const prefix = index === entries.length - 1 ? "└─" : "├─";
        const paddedKey = key.padEnd(longestKey, " ");
        return `${prefix} ${paddedKey} : ${value}`;
    });
};

const logSection = (title) => {
    console.log(DIVIDER);
    console.log(title);
    console.log(DIVIDER);
    console.log("");
};

const logStep = (message) => {
    console.log(withTimestamp(message));
    console.log("");
};

const logSuccess = (title, detailsObject = {}) => {
    console.log(withTimestamp(chalk.green(`SUCCESS ${title} ✅`)));
    formatDetails(detailsObject).forEach((line) => {
        console.log(line);
    });
    console.log("");
};

const logWarning = (message, detailsObject = {}) => {
    console.log(withTimestamp(chalk.yellow(`WARNING ${message}`)));
    formatDetails(detailsObject).forEach((line) => {
        console.log(chalk.yellow(line));
    });
    console.log("");
};

const logError = (errorMessage, error) => {
    const details = error instanceof Error ? error.message : error;

    console.log(withTimestamp(chalk.red(`ERROR ${errorMessage} ❌`)));

    if (details) {
        console.log(chalk.red(`└─ Details : ${details}`));
    }

    console.log("");
};

const logStatus = (status) => {
    console.log(DIVIDER);
    console.log(`STATUS: ${status}`);
    console.log(DIVIDER);
    console.log("");
};

module.exports = {
    getTimestamp,
    logError,
    logSection,
    logStatus,
    logStep,
    logSuccess,
    logWarning,
};
