const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    code:{
      type: String,
      required: [true, 'Code snippet is required'],
    },
    review:{
      type: String,
      required: [true, 'Review text is required'],
    },
  },
  {
    timestamps:true, // Automatically create createAt and updateAt field
  }
)

module.exports = mongoose.model('Review', reviewSchema)

