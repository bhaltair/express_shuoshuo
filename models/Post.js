//用户类
var mongoose = require("mongoose");
//Schema对象
var Schema = mongoose.Schema;

//设置schema
var postSchema = new Schema({
    "email" : String,
    "content" : String,
    "date" : Date,
    "comments" :[String]
});

//创建类
var Post = mongoose.model("posts",postSchema);
//向外暴露
module.exports = Post;