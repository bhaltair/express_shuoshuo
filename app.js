var express = require("express");
var app = express();
var router = require("./controller/router.js");
var session = require("express-session");
//数据库连接
var mongoose = require('mongoose');
//链接数据库，注意/后面的是数据库名字，如果数据不存在会自动创建
mongoose.connect('mongodb://localhost/shuoshuo');
//设置模板引擎
app.set("view engine","ejs");
//设置session
//使用session中间件，这些是express-session的API，必须写
app.use(session({
    //加密字符串 ，sid随机字符串就是根据这个东西来加密的
    secret: 'kaola',
    // 过期时间，10天
    expires : new Date(Date.now() + 1000 * 60 * 60 * 24 * 10),
    // 两个默认的配置，API要求
    resave: false,
    saveUninitialized: true
}));
//路由清单
app.get("/reg",router.showReg);             //显示注册页面
app.post("/reg",router.doReg);              //Ajax接口，完成注册
app.get("/checkexist",router.checkexist);   //Ajax接口，检查email是否被占用
app.get("/login",router.showLogin);         //显示登陆页面
app.post("/login",router.doLogin);         //Ajax接口，完成登陆
app.get("/profile",router.showProfile);     //个人资料页
app.post("/changeprofile",router.changeprofile); //Ajax接口，更改资料
app.get("/changeavatar",router.changeavatar);     //更改头像
app.post("/changeavatar",router.doChange);     //更改头像
app.get("/cut",router.cut); //裁剪图片
app.get("/",router.showIndex);  //显示首页
app.post("/fayan",router.fayan);    //发言Ajax接口
app.get("/getAllShuoshuo",router.getAllShuoshuo);    //发言Ajax接口
app.get("/shuoshuo/:id",router.showShuoshuo);    //发言Ajax接口

app.post('/comments',router.comments);
app.get('/logout',router.logout);
app.get('/getAllcomments/:id',router.getAllcomments);



//静态化
app.use("/public",express.static("public"));
app.use("/uploads",express.static("uploads"));
//监听
app.listen(3000);