exports.required = function required(object, key) {
    if (!key in object) {
        throw new Error(`Required key ${key} not found in object`);
    }

    return object[key];
};
