//用户类
var mongoose = require("mongoose");
//Schema对象
var Schema = mongoose.Schema;

//设置schema
var userSchema = new Schema({
    "email" : String,
    "password" : String,
    "avatar" : String,
    "nickname" : String,
    "signature" : String,
    "posts" : [String]
});
//提供一个静态方法，静态方法就是类名直接打点调用的方法
userSchema.statics.checkExist = function(email,callback){
    //this是类名，不是schema
    this.find({"email":email},function(err,results){
        if(results.length == 0){
            callback(false);
        }else{
            callback(true);
        }
    });
}
//创建类
var User = mongoose.model("users",userSchema);
//向外暴露
module.exports = User;