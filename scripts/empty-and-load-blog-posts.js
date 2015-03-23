/* =========================================================================
 *
 * load-blog-posts
 *  Loads blog posts from the ../templates/posts folder
 *
 * ========================================================================= */
var _ = require('lodash');
var logger = require('bragi');
var async = require('async');
var fs = require('fs');

var nconf = require('nconf');
require('../conf/configure')();
var db = require('../lib/database');

var mongoose = require('mongoose');
var Post = mongoose.model('Post');

// ======================================
//
// Script
//
// ======================================
// First, drop all the posts
mongoose.connection.collections.posts.drop( function(err) {
    // NOTE: err may exist if collection was not already created (this is ok)
    
    logger.log('load-blog-posts:dropPosts', 'Posts collection dropped!');

    // process and load new data
    return loadData();
});

// --------------------------------------
// Load Data
// --------------------------------------
function loadData(){
    // Posts data array
    // --------------------------------------
    var posts = [];    

    // read files
    // --------------------------------------
    var postDirectory = __dirname + '/../templates/posts/';

    fs.readdir(postDirectory, function(err, files){
        logger.log('load-blog-posts:readDir', 'files: %j', files);

        var META_REGEX = /^[\s\S ]*---([\s\S]*)---/;
        
        // Iterate over each file to process and load data
        async.each(
            files,
            function processFile( file, callback ){
                if(file.indexOf('.html') === -1){
                    logger.log('load-blog-posts:skipFile', 'skipping file: ' + file);
                    return callback();
                }
                // read data
                fs.readFile(postDirectory + file, 'utf8', function(err, data){
                    logger.log('load-blog-posts:readFile',
                    'reading file : %j', file);

                    // Get data at top of file
                    var postData = data.match(META_REGEX);
                    var post;

                    // get the actual data
                    postData = postData[1];
                    if(!postData){
                        throw new Error('Invalid postData format. Expected --- META ---');
                    }

                    // process postData
                    postData = postData.replace(/\n/g,'');
                    // we can trust the data here
                    postData = eval("(" + postData + ")");

                    // Get rid of postData in original data string
                    data = data.replace(META_REGEX, '');

                    postData.content = data;

                    // update meta fields
                    postData.slug = postData.slug.toLowerCase();
                    if(postData.created){
                        postData.created = new Date(postData.created);
                    }

                    // Setup the DB object
                    post = new Post(postData);
                    
                    post.save(function(err, res){
                        if(err){
                            logger.log('error:load-blog-posts:savedPost',
                            'error saving post: ' + err);
                            return callback(err,null);
                        }

                        logger.log('load-blog-posts:savedPost',
                        'saved post successfully | %j', post);
                        callback(null, res);
                    });
                });
            },
            function allDone( err, doneRes ){
                return process.exit(1);
            }
        );
    });
}
