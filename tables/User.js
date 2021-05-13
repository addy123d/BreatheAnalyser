const mongo = require("mongoose");
const schema = mongo.Schema;

const userSchema = new schema({
    name: {
        type: "String",
        required: true
    },
    age: {
        type: "String",
        required: true
    },
    gender: {
        type: "String",
        required: true
    },
    contact: {
        type: "String",
        required: true
    },
    password: {
        type: "String",
        required: true
    },
    readings: {
        type: [Object],
        required: true
    },
    timeStamp: {
        type: "String",
        required: true
    }
})


module.exports = User = mongo.model("user", userSchema);