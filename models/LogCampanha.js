const mongoose = require("mongoose");
const { Schema } = mongoose;

const LogCampanhaSchema = new Schema(
  {
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

    agendadoPara: {
      type: Date,
      default: null,
      index: true,
    },

    grupoAgendamento: {
      type: String,
      default: null,
      index: true,
    },

    indiceAgendamento: {
      type: Number,
      default: null,
    },

    campanhaSnapshot: {
      type: Schema.Types.Mixed,
      default: null,
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
  },
  {
    timestamps: true,
  },
);

mongoose.model("log_campanha", LogCampanhaSchema);
