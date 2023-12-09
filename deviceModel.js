const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema({
  deviceName: {type: String,required: true,},
  description: String,
  serialNumber: {type: String,required: true,},
  manufacturer: {type: String,required: true,},
  status: {type: String,default: 'Available',},
  data: Buffer,
  contentType: String,
});

const Device = mongoose.model('Device', deviceSchema);

module.exports = Device;