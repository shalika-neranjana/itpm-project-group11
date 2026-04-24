const express = require("express");
const router = express.Router();

const {
    addEntry,
    getEntries,
    updateEntry,
    deleteEntry,
} = require("../../controllers/MyInternships/dailyDiaryController");


router.post("/", addEntry);

router.get("/internship/:internshipId", getEntries);

router.put("/:id", updateEntry);

router.delete("/:id", deleteEntry);


module.exports = router;