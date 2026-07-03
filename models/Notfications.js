const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true }, // Employee who will receive the notification
    title: { type: String, required: true }, // Title of the notification
    message: { type: String, required: true }, // Message for the notification
    read: { type: Boolean, default: false }, // Mark if the notification is read
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
