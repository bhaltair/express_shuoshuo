var formidable = require("formidable");
var User = require("../models/User.js");
var Post = require("../models/Post.js");
var tool = require("../models/tool.js");
var Comment = require('../models/Comment.js');
var crypto = require("crypto");
var fs = require("fs");
var gm = require('gm');
var url = require("url");

//注册页面
exports.showReg = function(req,res){
    res.render("reg");
}

//执行注册
//-1 服务器错误
//-2 email已经被占用
exports.doReg = function(req,res){
    //得到post请求参数
    var form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, files) {
        if(err){
            res.send("-1");
            return;
        }
        console.log(fields);
        //加密
        var hash = crypto.createHash("sha256");
        var passwordSha256 = hash.update(fields.password).digest("hex");
        //检查用户名是否被占用
        User.checkExist(fields.email,function(boolean){
            if(boolean == true){
                res.send("-2");
                return;
            }
            //创建一个用户
            var u = new User({
                "email" : fields.email,
                "password" : passwordSha256
            });
            //保存用户
            u.save(function(err){
                if(err){
                    res.send("-1");
                    return;
                }
                res.send("1");
            });
        });

    });
}

//检查用户名是否被占用
exports.checkexist = function(req,res){
    var email = req.query.email;
    User.checkExist(email,function(boolean){
        res.send(boolean.toString());
    });
}

//显示登陆
exports.showLogin = function(req,res){
    res.render("login");
}

//登陆
//-1服务器错误
//-2没有这个用户
//-3密码不正确
//1登陆成功
exports.doLogin = function(req,res){
    //得到post请求参数
    var form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, files) {
        if(err){
            res.send("-1");
            return;
        }
        var email = fields.email;
        //加密
        var hash = crypto.createHash("sha256");
        var passwordSha256 = hash.update(fields.password).digest("hex");
        //检查数据库
        User.find({"email":email},function(err,results){
            if(err){
                res.send("-1");
                return;
            }
            if(results.length == 0){
                res.send("-2");
                return;
            }
            //密码不匹配
            if(results[0].password != passwordSha256){
                res.send("-3");
                return;
            }
            //设置session
            req.session.login = true;
            req.session.email = email;
            res.send("1");
        });
    });
}

//个人资料页
exports.showProfile = function(req,res){
    //本页面需要登陆
    if(!req.session.login){
        res.send("本页面需要登陆");
        return;
    }

    //准备数据
    User.find({"email":req.session.email},function(err,results){
        var user = results[0];
        var avatar = user.avatar ?  "/uploads/" + user.avatar + ".jpg" : "/public/images/avatar.png";

        res.render("profile",{
            "email" : req.session.email,
            "avatar" : avatar,
            "signature" : results[0].signature,
            "nickname" : results[0].nickname,
        });
    });
}

//更改头像
exports.changeavatar = function(req,res){
    //本页面需要登陆
    if(!req.session.login){
        res.send("本页面需要登陆");
        return;
    }

    res.send('<form action="/changeavatar" enctype="multipart/form-data" method="post">'+
        '<input type="file" name="touxiang"><br>'+
        '<input type="submit" value="上传头像">'+
        '</form>');
}

//裁剪头像页面，这个页面也负责头像的上传
exports.doChange = function(req,res){
    var form = new formidable.IncomingForm();
    //设置上传目录
    form.uploadDir = "./uploads";
    //人家让这么写，别问，直接复制！
    form.parse(req, function(err, fields, files) {

        //确认有文件上来
        if(files.length == 0){
            res.send("非法操作，请上传图片！");
            return;
        }
        //改名逻辑
        //改名，给上传的文件加上.jpg后缀
        fs.rename("./" + files.touxiang.path , "./" + files.touxiang.path + ".jpg",function(err){
            if(err){

                res.send("改名失败，请重新上传图片！");
                return;
            }

            //强行缩小这张图片，把高度设置为260
            gm("./" + files.touxiang.path + ".jpg").resize(360,360).write("./" + files.touxiang.path + ".jpg",function(err){
                if(err){

                    res.send("没有缩小成功，请重新上传图片！");
                    return;
                }

                res.render("cut",{
                    "email" : req.session.email,
                    //图片的文件名，注意没有路径，所以我们substr(8)
                    "avatarurl" : files.touxiang.path.substr(8)
                });
            });
        })

    });
};

//图片剪裁接口
exports.cut = function(req,res){
    var x = parseFloat(req.query.x);
    var y = parseFloat(req.query.y);
    var w = parseFloat(req.query.w);
    var h = parseFloat(req.query.h);
    var file = req.query.file;

    //console.log(x,y,w,h,file);
    gm("./uploads/" + file + ".jpg").crop(w, h, x, y).resize(100,100).write("./uploads/" + file + ".jpg",function(err){
        if(err){
            res.send("-1");
            return;
        }
        //把图片地址写入数据库
        User.find({"email":req.session.email},function(err,results){
            results[0].avatar = file;
            results[0].save(function(err){
                if(err){
                    res.send("-1");
                    return;
                }
                res.send("1");
            });
        });

    });
}

//个人资料页更改
exports.changeprofile = function(req,res) {
    var form = new formidable.IncomingForm();
    //人家让这么写，别问，直接复制！
    form.parse(req, function (err, fields) {
        var nickname = fields.nickname;
        var signature = fields.signature;

        //持久
        User.find({"email":req.session.email},function(err,results){
            results[0].nickname = nickname;
            results[0].signature = signature;
            results[0].save(function(err){
                if(err){
                    res.send("-1");
                    return;
                }
                res.send("1");
            });
        });
    });
}

//显示首页
exports.showIndex = function(req,res){
    //如果登录了就显示首页，如果没有登录显示登录页面
    if(req.session.login){
        //准备数据
        User.find({"email":req.session.email},function(err,results){
            var user = results[0];
            var avatar = user.avatar ?  "/uploads/" + user.avatar + ".jpg" : "/public/images/avatar.png";


            res.render("index",{
                "email" : req.session.email,
                "avatar" : avatar,
                "signature" : results[0].signature,
                "nickname" : results[0].nickname,
            });
        });
    }else{
        res.render("login");
    }
}

//发言
exports.fayan = function(req,res) {
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields) {
        var email = fields.email;
        var content = fields.content;

        //console.log(email,content);

        tool.fayan(email,content,function(result){
            res.send(result)
        });
    });
}

//得到所有说说
exports.getAllShuoshuo = function(req,res){
    Post.find({},function(err,results){
        var count = 0;
        var jieguo = [];
        //我们现在要遍历这个数组，然后丰富它
        for(var i = 0 ; i < results.length ; i++){
            (function(i){
                User.find({"email":results[i].email},function(err,users){
                    var user = users[0];
                    jieguo.push({
                       "avatar" : user.avatar,
                       "nickname" : user.nickname,
                        "content" : results[i].content,
                        "date" : results[i].date,
                        "email" : results[i].email,
                        "id" : results[i]._id,
                        "comNum" : results[i].comments.length

                    });
                    count++;
                    if(count == results.length){
                        res.send(jieguo);
                    }
                });
            })(i);
        }
    });
};

//展示一条说说
exports.showShuoshuo = function(req,res){
    if(!req.session.login){
        res.redirect('/login')
        return;
    }
    //本页面需要登陆
    var id = req.params["id"];
    //找到帖子
    Post.find({"_id" : id},function(err,posts){
        var post = posts[0];
        User.find({"email":posts[0].email},function(err,users){
            var fatieren = users[0];

            User.find({"email" : req.session.email},function(err,users){
                var dengluzhegeren = users[0];
                var avatar = dengluzhegeren.avatar ?  "/uploads/" + dengluzhegeren.avatar + ".jpg" : "/public/images/avatar.png";

                res.render("shuoshuo",{
                    "postID" : req.params["id"],
                    "login" : true,
                    "nickname" : dengluzhegeren.nickname,
                    "fatienagerendenickname" : fatieren.nickname,
                    "content" : post.content,
                    "date" : new Date(post.date).toLocaleString(),
                    "avatar" : avatar,
                    "email" : dengluzhegeren.email
                });
            });

            /*if(req.session.login){
                User.find({"email" : req.session.email},function(err,users){
                    var dengluzhegeren = users[0];
                    var avatar = dengluzhegeren.avatar ?  "/uploads/" + dengluzhegeren.avatar + ".jpg" : "/public/images/avatar.png";

                    res.render("shuoshuo",{
                        "login" : true,
                        "nickname" : dengluzhegeren.nickname,
                        "fatienagerendenickname" : fatieren.nickname,
                        "content" : post.content,
                        "date" : new Date(post.date).toLocaleString(),
                        "avatar" : avatar,
                        "email" : dengluzhegeren.email
                    });
                });
            }else{
                //如果没有登陆 游客身份
                res.render("shuoshuo",{
                    "login" : false,
                    "fatienagerendenickname" : fatieren.nickname,
                    "date" : new Date(post.date).toLocaleString(),
                    "content" : post.content
                });
            }*/
        })
    });
}

exports.comments = function(req,res){
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields) {
        var email = fields.email;
        var content = fields.content;
        var postID = fields.postID;
        tool.comments(email,content,postID,function(result){
            res.send(result)
        });
    });
}

exports.logout = function(req,res){
    // 重置session
    req.session.login = null;
    req.session.email = null;
    // 重定向
    res.redirect('/');
}


exports.getAllcomments = function(req,res) {
    //遍历所有comments 当前post的
    var id = req.params["id"];
    Comment.find({"postID":id},function(err,result){
        if(err){
            res.send("-1");
            return;
        }
        res.send(result);
    })
}