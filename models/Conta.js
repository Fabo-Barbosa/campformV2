const mongoose = require("mongoose");
const { Schema } = mongoose;

const ContaSchema = new Schema({
  cod: {
    type: Number,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
});

mongoose.model("conta", ContaSchema);
