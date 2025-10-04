// eslint.config.mjs
import next from "eslint-config-next";

export default [
  ...next,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "react-hooks/exhaustive-deps": "warn",
    },
  },
];
