/* =========================================================================
 *
 * posts
 *      Posts related functionality
 *
 *  ======================================================================== */
var _ = require('lodash');
var logger = require('bragi');
var nconf = require('nconf');

var request = require('request');
var mongoose = require('mongoose');

var Post = mongoose.model('Post');

var getTemplateVariables = require('../util/get-template-variables');
var setCacheHeaders = require('../util/set-cache-headers');

var renderErrors = require('../util/render-errors');
// ======================================
// 
// Routes
// 
// ======================================
module.exports.routeRenderBlog = function routeRenderBlog ( req, res ){
    // Get All posts ordered by created date
    Post.find({})
        .sort({created: -1})
        .setOptions({ lean: true })
        .exec(function fetchedPosts( err, posts ){
            if(err){
                logger.log('error:getPosts:fetchedPost',
                'error fetching post or nor postRes | error: ' + err);
                setCacheHeaders(res, 0);
                return renderErrors.page500( req, res );
            }

            return res.render(
                'blog.html', 
                getTemplateVariables({ 
                    title: 'Blog', page: 'blog',
                    posts: posts
                })
            );

        });
};


// --------------------------------------
//
// Individual post by slug
//
// --------------------------------------
module.exports.routeRenderPostBySlug = function routeRenderPostBySlug ( req, res ){
    var slug = req.param('slug');
    slug = slug.toLowerCase();

    Post.find({ slug: slug })
        .setOptions({ lean: true })
        .limit(1)
        .exec(function fetchedPost( err, postRes ){
            if(err || !postRes || (postRes && postRes.length < 1 )){
                setCacheHeaders(res, 0);
                logger.log('error:getPostBySlug:fetchedPost',
                'error fetching post or nor postRes | error: ' + err);

                return renderErrors.page404( req, res );
            }

            var post = postRes[0];

            return res.render('post.html', getTemplateVariables({
                title: post.title,
                post: post,
                page: 'post'
            }));
        });
};

// --------------------------------------
//
// Posts by CATEGORY
//
// --------------------------------------
module.exports.routeRenderPostsByCategory = function routeRenderPostsByCategory ( req, res ){
    var category = req.param('category');
    category = category.toLowerCase().trim().replace(/ /g, '-');

    Post.find({ categoryLower: category })
        .setOptions({ lean: true })
        .exec(function fetchedPost( err, postRes ){
            if(err || !postRes || (postRes && postRes.length < 1 )){
                setCacheHeaders(res, 0);
                logger.log('error:getPostBySlug:fetchedPost',
                'error fetching post or nor postRes | error: ' + err);

                return renderErrors.page404( req, res );
            }

            return res.render('posts-by-category.html', getTemplateVariables({
                title: 'Post by Tags: ' + category,
                category: category,
                posts: postRes,
                page: 'posts-by-category'
            }));
        });
};

// --------------------------------------
//
// Posts by TAG
//
// --------------------------------------
module.exports.routeRenderPostsByTag = function routeRenderPostsByTag ( req, res ){
    var tag = req.param('tag');
    tag = tag.toLowerCase().trim().replace(/ /g, '-');

    Post.find({ tagsLower: tag })
        .setOptions({ lean: true })
        .exec(function fetchedPost( err, postRes ){
            if(err || !postRes || (postRes && postRes.length < 1 )){
                setCacheHeaders(res, 0);
                logger.log('error:getPostBySlug:fetchedPost',
                'error fetching post or nor postRes | error: ' + err);

                return renderErrors.page404( req, res );
            }

            return res.render('posts-by-tag.html', getTemplateVariables({
                title: 'Post by Tags: ' + tag,
                tag: tag,
                posts: postRes,
                page: 'posts-by-tag'
            }));
        });
};
