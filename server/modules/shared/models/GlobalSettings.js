const mongoose = require('mongoose')
require('mongoose-long')(mongoose)
const Schema = mongoose.Schema

const GlobalSettingsSchema = new Schema({
  key: { type: String },
  value: { type: String },

  created_at: { type: Date, default: Date.now, index: true },
  updated_at: { type: Date, default: Date.now },
})

GlobalSettingsSchema.pre('save', function (next) {
  const now = new Date()
  this.updated_at = now
  if (!this.created_at) {
    this.created_at = now
  }
  return next();
})

GlobalSettingsSchema.statics.isObjectId = (id) =>
  mongoose.Types.ObjectId.isValid(id)

GlobalSettingsSchema.statics.getObjectId = (id) =>
  mongoose.Types.ObjectId(id)
const GlobalSettingsModel = mongoose.model('GlobalSettings', GlobalSettingsSchema);

module.exports = GlobalSettingsModel;
