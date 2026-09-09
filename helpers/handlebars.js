// helpers/handlebars.js
const behavior_scripts = {
  send_form: "/utils/js/behaviorSendForm.js",
  hsm_register: "/utils/js/behaviorHsmRegister.js",
  hsm_edit: "/utils/js/behaviorHsmEdit.js",
  flow_register_edit: "/utils/js/behaviorFlowRegisterEdit.js",
  logs_list: "/utils/js/behaviorLogsList.js",
  disc_form: "/utils/js/behaviorSendFormDisc.js",
  camp_report: "/utils/js/behaviorCampLogReport.js",
};

const badges_status = {
  FINALIZADO: {
    btsrp: "badge bg-success",
    classStyle: "status-campanha status-campanha-finalizado",
  },
  ABORTADO: {
    btsrp: "badge bg-danger",
    classStyle: "status-campanha status-campanha-abortado",
  },
  AGUARDANDO: {
    btsrp: "badge bg-secondary",
    classStyle: "status-campanha status-campanha-aguardando",
  },
  ENVIANDO: {
    btsrp: "badge bg-primary",
    classStyle: "status-campanha status-campanha-enviando",
  },
  CANCELADO: {
    btsrp: "badge bg-warning text-dark",
    classStyle: "status-campanha status-campanha-cancelado",
  },
};

module.exports = {
  eq: (a, b) => a === b,
  ne: (a, b) => a !== b,
  lt: (a, b) => a < b,
  lte: (a, b) => a <= b,
  gt: (a, b) => a > b,
  gte: (a, b) => a >= b,

  and: (a, b) => a && b,
  or: (a, b) => a || b,
  not: (a) => !a,
  initWith: (t, c) => String(t || "").startsWith(c),

  upper: (text) => String(text || "").toUpperCase(),
  lower: (text) => String(text || "").toLowerCase(),
  concat: (a, b) => a + b,

  json: (context) => JSON.stringify(context),

  formatDate: (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("pt-BR");
  },

  formatDateTime: (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleString("pt-BR");
  },

  currency: (value) => {
    const number = Number(value || 0);
    return number.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  },

  default: (value, defaultValue) => {
    return value ?? defaultValue;
  },

  ternary: (condition, trueValue, falseValue) => {
    return condition ? trueValue : falseValue;
  },

  contains: (text, search) => {
    return String(text || "").includes(String(search || ""));
  },

  isArray: (value) => Array.isArray(value),

  length: (value) => {
    if (Array.isArray(value) || typeof value === "string") return value.length;
    return 0;
  },

  behaviorScript: (context) => {
    return behavior_scripts[context];
  },

  statusColorBadge: (status) => {
    return badges_status[status].btsrp;
  },

  statusColorClassStyle: (status) => {
    return badges_status[status].classStyle;
  },
};
