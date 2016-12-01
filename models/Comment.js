/**
 * Created by Danny on 2016/10/27 18:02.
 */
//用户类
var mongoose = require("mongoose");
//Schema对象
var Schema = mongoose.Schema;

//设置schema
var commentSchema = new Schema({
    "email" : String,
    "content" : String,
    "postID"   : String,
    "date" : Date
});

//创建类
var Comment = mongoose.model("comments",commentSchema);
//向外暴露
module.exports = Comment;