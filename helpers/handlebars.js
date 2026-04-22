// helpers/handlebars.js
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

  upper: (text) => String(text || "").toUpperCase(),
  lower: (text) => String(text || "").toLowerCase(),
  concat: (a, b) => a + b,

  json: (context) => JSON.stringify(context),

  formatDate: (date) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("pt-BR");
  },

  formatDateTime: (date) => {
    if (!date) return "";
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
};
