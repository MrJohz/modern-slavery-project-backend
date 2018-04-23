module.exports = {
    "env": {
        "es6": true,
        "node": true
    },
    "extends": "eslint:recommended",
    "rules": {
        "semi": ["error", "always"],
        "complexity": ["error", 10],
        "max-depth": ["error", 4],
        "max-statements": ["error", 10],
        "max-params": ["error", 3],
        "max-nested-callbacks": ["error", 3],
    },
    "parserOptions": {
        "ecmaVersion": "2017"
    }
};
