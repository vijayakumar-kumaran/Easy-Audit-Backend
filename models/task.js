const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
    assignedFrom: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
    status: { type: String, enum: ['Pending', 'In Progress', 'Completed'], default: 'Pending' },
    dueDate: { type: Date },
    empDescription: {type: String, require: true},
    remarks: String
  },
  { timestamps: true }  // This will add createdAt and updatedAt fields
);

module.exports = mongoose.model('Task', taskSchema);
