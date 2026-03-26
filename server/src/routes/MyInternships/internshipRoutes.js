const express = require("express");
const router = express.Router();

const {
    addInternship,
    getInternships,
    getInternshipById,
    updateInternship,
    deleteInternship,
} = require("../../controllers/MyInternships/internshipController");


router.post("/", addInternship);

router.get("/student/:studentId", getInternships)

router.get("/:id", getInternshipById);

router.put("/:id", updateInternship);

router.delete("/:id", deleteInternship);


module.exports = router;