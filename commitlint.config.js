module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [
      2,
      "always",
      [
        "feat",
        "update", // Update feature
        "fix",
        "config", // config changes like package.json, .eslintrc
        "docs",
        "style",
        "refactor",
        "ci",
        "chore",
        "revert",
        "test",
      ],
    ],
    "scope-enum": [2, "always", ["app", "completion", "source", "types", "engine262", "misc"]],
    "subject-case": [0, "always"],
    "body-max-line-length": [1, "always", 300]
  },
};
