// models/Case.js
const mongoose = require("mongoose");
const { Schema } = mongoose;
const { parse } = require("date-fns");

// A totally free-form sub-schema (strict:false) for parties
const PartySchema = new Schema(
  {
    name: { type: String, trim: true },
    attorney: { type: String, trim: true },
    attorneyPhone: { type: String, trim: true },
    // address will be injected dynamically
    address: { type: String, trim: true },
  },
  { strict: false } // <-- allow additional party fields
);

// A judgment detail with fixed shape
const JudgmentDetailSchema = new Schema(
  {
    name: { type: String, trim: true },
    date: { type: String, trim: true },
  },
  { _id: false, strict: false }
);

const CaseSchema = new Schema(
  {
    caseNumber: {
      type: String,
      required: [true, "Case number is required"],
      unique: true,
      trim: true,
    },
    pdfUrl: { type: String, trim: true },

    plaintiffs: { type: [PartySchema], default: [] },
    defendants: { type: [PartySchema], default: [] },
    judgmentDetails: { type: [JudgmentDetailSchema], default: [] },

    caseType: { type: String, trim: true },
    dateFiled: {
      type: Date,
      set: (val) => {
        if (typeof val === "string") {
          // parse “M/D/YYYY” into a Date
          return parse(val, "M/d/yyyy", new Date());
        }
        return val; // already a Date
      },
    },

    // Indicates if address extraction has completed
    addressesArrived: { type: Boolean, default: false },

    // Store any error encountered during address extraction
    addressError: { type: String, default: null },

    additionalData: { type: Schema.Types.Mixed, default: {} },
  },
  {
    timestamps: true,
    strict: false,
  }
);

CaseSchema.index({ caseNumber: 1 });

module.exports = mongoose.model("Case", CaseSchema);
