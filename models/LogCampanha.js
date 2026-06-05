const mongoose = require("mongoose");
const { Schema } = mongoose;

const LogCampanhaSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  hsmId: {
    type: Schema.Types.ObjectId,
    ref: "hsm",
    required: true,
  },
  flow: {
    type: Schema.Types.ObjectId,
    ref: "fluxo",
  },
  conta: {
    type: Schema.Types.ObjectId,
    ref: "conta",
    required: true,
  },
  agendamentos: [
    {
      type: Date,
    },
  ],
  dataEnvio: {
    type: Date,
    default: new Date(),
  },
  finalizadoEm: {
    type: Date,
    default: null,
  },
  sendType: {
    type: Number,
    required: true,
  },
  forcaEnvio: {
    type: Boolean,
    default: false,
  },
  total: {
    type: Number,
    default: 0,
  },
  sucessos: {
    type: Number,
    default: 0,
  },
  erros: {
    type: Number,
    default: 0,
  },

  status: {
    type: String,
    enum: ["ENVIANDO", "ABORTADO", "AGUARDANDO", "FINALIZADO", "CANCELADO"],
    default: "AGUARDANDO",
    index: true,
  },
});

mongoose.model("log_campanha", LogCampanhaSchema);
