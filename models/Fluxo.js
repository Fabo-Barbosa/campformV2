const mongoose = require("mongoose");
const { Schema } = mongoose;

const FluxoSchema = new Schema({
  cod: {
    type: Number,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  conta: {
    type: Schema.Types.ObjectId,
    ref: "conta",
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  variables: {
    type: Object,
    default: {},
  },
});

mongoose.model("fluxo", FluxoSchema);
