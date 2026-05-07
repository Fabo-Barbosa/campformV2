const mongoose = require("mongoose");
const { Schema } = mongoose;

const HsmSchema = new Schema({
  cod: {
    type: Number,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  conta: {
    type: Schema.Types.ObjectId,
    ref: "conta",
    required: true,
  },
  type: {
    type: String,
    enum: ["Marketing", "Utility", "Authentication"],
    default: "Marketing",
    required: true,
  },
  variables: {
    type: Object,
    default: {},
  },
});

mongoose.model("hsm", HsmSchema);
