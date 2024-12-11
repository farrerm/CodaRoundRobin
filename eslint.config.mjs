import globals from "globals";
import pluginJs from "@eslint/js";
import prettier from "eslint-plugin-prettier"; // Import the Prettier plugin

/** @type {import('eslint').Linter.Config} */
const config = {
  files: ["**/*.js"],
  languageOptions: {
    sourceType: "commonjs", // Use commonjs for Node.js
    ecmaVersion: 2021, // Specify ECMAScript version
    globals: {
      ...globals.browser,
      process: true, // Declare process as a global variable
    },
  },
  plugins: {
    prettier, // Define Prettier as a plugin object
  },
  rules: {
    "prettier/prettier": "error", // Treat Prettier issues as ESLint errors
    "no-undef": "error", // Ensure no undefined variables are used
  },
};

// Export the configuration as an array with the recommended config
export default [config, pluginJs.configs.recommended];
