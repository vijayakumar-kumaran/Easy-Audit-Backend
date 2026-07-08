const mongoose = require('mongoose');

// Business Assessment Type Schema
const BusinessAssessmentTypeSchema = new mongoose.Schema({
  item_id: { type: Number, required: true },
  bassessmentvalues: { type: String, required: true }
});

// Business Notice Type Schema
const BusinessNoticeTypeSchema = new mongoose.Schema({
  item_id: { type: Number, required: true },
  noticetype: { type: String, required: true },
  noticedescription: { type: String, default: '' }
});

// Individual Notice Type Schema
const IndividualNoticeTypeSchema = new mongoose.Schema({
  item_id: { type: Number, required: true },
  noticetype: { type: String, required: true },
  noticedescription: { type: String, default: '' }
});

module.exports = {
  BusinessAssessmentType: mongoose.model('BusinessAssessmentType', BusinessAssessmentTypeSchema),
  BusinessNoticeType: mongoose.model('BusinessNoticeType', BusinessNoticeTypeSchema),
  IndividualNoticeType: mongoose.model('IndividualNoticeType', IndividualNoticeTypeSchema)
};
