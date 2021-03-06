/* =========================================================================
 *
 * Post.js
 *     Post model definition
 *
 * ========================================================================= */
var mongoose = require('mongoose');
var nconf = require('nconf');
var _ = require('lodash');
var toLower = require('../util/to-lower');


var PostSchema = new mongoose.Schema({
    title: {type: String},
    slug: {type: String, index: true, unique: true, sparse: true},

    created: {type: Date, 'default': Date.now },

    description: {type: String},

    category: {type: String},
    categoryLower: {type: String},

    tags: [{type: String}],

    // if tags are provided for the post, automatically turn them into lower 
    // case
    tagsLower: [{type: String}],

    // time to read ( in minutes)
    timeToRead: {type: Number, 'default': 5},

    // Actual post HTML
    content: {type: String},

    // twitter settings (can be null)
    hashtags: [],
    twitterText: {type: String}


});

// ======================================
//
// Functions
// 
// ======================================

// Methods
// --------------------------------------
PostSchema.pre('save', function (next) {
    // Before model is saved, do some stuff
    var self = this;

    if(this.isNew){
        if(this.tags){
            this.tagsLower = [];
            _.each(this.tags, function(tag, i){
                self.tagsLower.push(toLower(tag));
            });
        }
        if(this.category){
            this.categoryLower = toLower(this.category);
        }
    }

    next();
});


// Register the schema
// --------------------------------------
mongoose.model('Post', PostSchema);
module.exports = PostSchema;
