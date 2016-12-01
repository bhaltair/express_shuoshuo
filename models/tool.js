var Post = require("./Post.js");
var User = require("./User.js");
var Comments = require('./Comment.js');

exports.fayan = function(email,content,callback){
    //要更改两个表的东西posts、users
    var p = new Post({
        "email" : email,
        "content" : content,
        "date" : new Date()
    });

    p.save(function(err){
        if(err){
            console.log("保存失败");
            return;
        }
        console.log("帖子保存成功");
        //更改用户的posts属性
        User.find({"email":email},function(err,results){
            results[0].posts.push(p._id);
            results[0].save(function(err){
                if(err){
                    console.log("用户更改失败");
                    return;
                }
                console.log("用户更改成功");
                callback && callback("1");
            });
        });
    });
}

exports.comments = function(email,content,postID,callback) {
    //新建一个评论
    var c = new Comments({
        "email" : email,
        "content" : content,
        "postID"   : postID,
        "date" : new Date()
    });

    c.save(function (err) {
        if(err){
            callback && callback("-1");
            return;
        }
        Post.find({"_id":postID}, function (err,result) {
            if(err){
                callback("-1");
                return;
            }
            result[0].comments.push(c._id);
            result[0].save(function(err){
                if(err){
                    console.log("失败");
                    return;
                }
                console.log("评论保存成功");
                callback && callback("1");
            });
        })


    });

}