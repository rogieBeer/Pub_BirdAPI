const mongoose = require('mongoose')


const birdSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: true
    }, //
    birdDateAdded: {
        type: Date, 
        required: true,
        default: Date.now
    }, //
    commonName: {type: String}, //
    order: {type: String}, //
    genus: {type: String}, //
    species: {type: String}, //
    binomialName: {type: String}, //
    maoriNames: [],
    summary: {type: String}, //
    conservationStatus: {type: String},
    statusEndemic: {type: String}, //
    habitat: [], //
    modules: [], //
    confusiable: [], //
    callLevel: {type: String}, //
    showContent: Boolean, //
    uploadedAudio: [{//
        audioID: {type: String},
        sex: {type: String},
        call: {type: String},
        callURL: {type: String},
        date: {
            type: Date, 
            required: true,
            default: Date.now
        },
        location: {type: String},
        region: {type: String},
        fileName: {type: String},
        comments: {type: String},
        sono: {type: String}
    }],
    xenoCanto: {}, //
    showxenoCanto: Boolean, //
    mainImage: {type: String}, //
    // wikiImage: {type: String},
    wikiID: {type: String}, //
    dir: {type: String} //
})

module.exports = mongoose.model('Bird', birdSchema)
