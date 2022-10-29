const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const noteSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    text: {
        type: String,
        required: true
    },
    tag: {
        type: Array,
        required: true
    },
    categoryId: {
        type: Schema.Types.ObjectId,
        ref: 'Category'
    },
    creator: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
    }, 
    {timestamps: true}
);

module.exports = mongoose.model('Note', noteSchema)