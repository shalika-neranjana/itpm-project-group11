/**
 * Final Report model for internship completion report
 */

const mongoose = require("mongoose");

const finalReportSchema = new mongoose.Schema(
  {
    internship: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Internship",
      required: true,
    },

    executiveSummary: {
      type: String,
      required: true,
    },

    keyAccomplishments: [{ type: String }],
    skillsAcquired: [{ type: String }],
    attachments: [{ type: String }],

    conclusionRecommendations: {
      type: String,
      required: true,
    },

    attachments: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["draft", "submitted"],
      default: "draft",
    },
  },
  {
    timestamps: true,
  },
);

const FinalReport = mongoose.model("FinalReport", finalReportSchema);

module.exports = FinalReport;
