const mongoose = require("mongoose");
const { Schema } = mongoose;

const UserSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    hash: {
        type: String,
        required: true
    },
    active: {
        type: Boolean,
        default: true
    },
    eAdmin: {
        type: Number,
        default: 0
    }
});

mongoose.model("user", UserSchema);