// +----------------------------------------------------------------------
// | Bieber [ 美媒网站内容管理框架 ]
// +----------------------------------------------------------------------
// | Copyright (c) 2017 http://www.gzxinbibo.com All rights reserved.
// +----------------------------------------------------------------------
// | Author: Tony <912697590@qq.com>
// +----------------------------------------------------------------------

'use strict';

import Base from './base.js';
import pingpp from 'pingpp';
import http from 'http';
import fs from 'fs';
import API from 'wechat-api';
import JSSDK from './jssdk.js';
export default class extends Base {
    async __before() {
            //网站配置
            this.setup = await this.model("setup").getset();
            this.api = new API(this.setup.wx_AppID, this.setup.wx_AppSecret);
            this.jssdk = JSSDK; //new JSSDK(this.setup.wx_AppID, this.setup.wx_AppSecret);
        }
        /**
         * index action
         * @return {Promise} []
         */
    indexAction() {
        //auto render template file index_index.html
        return this.display();
    }
    async oauthAction() {
            //判断是否是微信浏览器
            //微信公众账号内自动登陆
            let openid = await this.session("wx_openid");
            //openid =null;// await this.session("wx_openid",null);
			console.log("oauthAction--------"+openid);
            if (is_weixin(this.userAgent()) && (think.isEmpty(openid)||typeof openid == 'undefined')) {
                // 先把url暂存起来
                this.cookie("bieber_wx_url", this.http.url);
                var oauthUrl = pingpp.wxPubOauth.createOauthUrlForCode(this.setup.wx_AppID, `http://${this.http.host}/uc/weixin/getopenid?showwxpaytitle=1`,true);
                console.log("oauthAction-----------" + oauthUrl)
                this.redirect(oauthUrl);
            }

        }
        //用微信客户端获取getopenid
    async getopenidAction() {
        //获取用户openid
        let code = this.get("code");
        console.log(code);
        //获取openid
        let getopenid = () => {
            let deferred = think.defer();
            pingpp.wxPubOauth.getOpenid(this.setup.wx_AppID, this.setup.wx_AppSecret, code, function(err, openid) {
                //console.log(openid);
                deferred.resolve(openid);
                // ...
                // pass openid to extra['open_id'] and create a charge
                // ...
            });
            return deferred.promise;
        };
        let openid = await getopenid();
        //9think.log(think.isEmpty(openid));
        let userinfo = await getUser(this.api, openid);
        console.log("userinfo-------------"+JSON.stringify(userinfo));
        //如果没有关注先跳到关注页面
        //if (userinfo.subscribe == 0) {
        //    console.log(1111111111111)
        //    this.redirect('/uc/weixin/follow');
        //    return false;
        //};
        //userinfo.subscribe_time = userinfo.subscribe_time * 1000;
		userinfo.subscribe_time = new Date().getTime();
        let wx_user = await this.model("wx_user").where({ openid: openid }).find();

        //存储Openid
        await this.session('wx_openid', openid);
        if (think.isEmpty(wx_user)) {
            await this.model("wx_user").add(userinfo);
            //this.redirect("/uc/weixin/signin");
        } else {
            await this.model("wx_user").where({ openid: openid }).update(userinfo);

            //检查微信号是否跟网站会员绑定
            //if (think.isEmpty(wx_user.uid)) {
                //没绑定跳转绑定页面
            //    this.redirect("/uc/weixin/signin");

            //} else 
				{
                //更新微信头像
                let filePath = think.RESOURCE_PATH + '/upload/avatar/' + wx_user.uid;
                think.mkdir(filePath)
                await this.spiderImage(userinfo.headimgurl, filePath + '/avatar.png')
                    //绑定直接登陆
                let last_login_time = await this.model("member").where({ id: wx_user.uid }).getField("last_login_time", true);

                let wx_userInfo = {
                    'uid': wx_user.uid,
                    'username': userinfo.nickname,
                    'last_login_time': last_login_time,
                };
                await this.session('webuser', wx_userInfo);
                this.redirect(this.cookie("bieber_wx_url"));
            }
        }


    }

    /**
     * 没有关注提示关注
     */
    async followAction() {
        //console.log(this.setup)
        //创建关注二维码
        //TODO
        // let titck =await createLimitQRCode(this.api,1);
        // console.log(titck);
        let qrcod = this.api.showQRCodeURL("gQF_8DwAAAAAAAAAAS5odHRwOi8vd2VpeGluLnFxLmNvbS9xLzAyMXRCbEExc2pmbDAxMDAwMGcwM08AAgTTf1JZAwQAAAAA");
        this.assign("qrurl", qrcod);
        console.log("qrurl============" + qrcod);
        //think.log(qrcod);
        // this.end(qrcod);
        this.meta_title = `扫码关注`;
        //判断浏览客户端
        if (checkMobile(this.userAgent())) {
            return this.display(`mobile/${this.http.controller}/${this.http.action}`);
        } else {
            return this.display();
        }
    }

    /**
     * 微信账号与网站会员绑定
     */
    async signinAction() {
            // await this.session('wx_openid',"o33lBt0Pz3rEXUARWtUUO5GxuUG0");
            let open_id;
            if (think.isEmpty(this.cookie("wx_openid"))) {
                open_id = await this.session("wx_openid");
                this.cookie("wx_openid", open_id);
            } else {
                open_id = this.cookie("wx_openid");
            }

            //清除openid，如果中途失败，可重新激活注册流程
            await this.session('wx_openid', null);
            let wx_info = await this.model("wx_user").where({ openid: open_id }).find();
            this.assign("wx_info", wx_info);
            this.meta_title = "账号绑定";
            this.assign("openid", open_id);
            this.assign("headimgurl", wx_info.headimgurl)
                //todo
            if (checkMobile(this.userAgent())) {
                return this.display(`mobile/${this.http.controller}/${this.http.action}`);
            } else {
                return this.display();
            }
            // this.end("网站会员绑定页面")
        }
        /**完善资料绑定 */
    async organizingAction() {
            let data = this.post();
            //验证
            let res;
            if (think.isEmpty(data.username)) {
                return this.fail("用户昵称不能为空！");
            } else {
                res = await this.model("member").where({ username: ltrim(data.username) }).find();
                if (!think.isEmpty(res)) {
                    return this.fail("用户昵称已存在，请重新填写！")
                }
            }
            if (think.isEmpty(data.mobile)) {
                return this.fail("手机号码不能为空！")
            } else {
                res = await this.model("member").where({ mobile: data.mobile }).find();
                if (!think.isEmpty(res)) {
                    return this.fail("手机号码已存在，请重新填写！")
                }
            }
            if (think.isEmpty(data.email)) {
                return this.fail("电子邮箱不能为空！")
            } else {
                res = await this.model("member").where({ email: data.email }).find();
                if (!think.isEmpty(res)) {
                    return this.fail("电子邮箱已存在，请重新填写！")
                }
            }
            if (think.isEmpty(data.password) && think.isEmpty(data.password2)) {
                return this.fail("密码不能为空！")
            } else {

                if (data.password != data.password2) {
                    return this.fail("两次输入的密码不一致，请重新填写！")
                }
            }
            data.status = 1;
            data.reg_time = new Date().valueOf();
            data.reg_ip = _ip2int(this.ip());
            data.password = encryptPassword(data.password);
            let reg = await this.model("member").add(data);

            if (!think.isEmpty(reg)) {
                //用户副表
                await this.model("wx_user").where({ openid: data.openid }).update({ uid: reg });
                //更新微信头像
                let filePath = think.RESOURCE_PATH + '/upload/avatar/' + reg;
                think.mkdir(filePath)
                await this.spiderImage(data.headimgurl, filePath + '/avatar.png')
            }
            console.log(data);
            await this.model("member").autoLogin({ id: reg }, this.ip()); //更新用户登录信息，自动登陆
            let wx_userInfo = {
                'uid': reg,
                'username': data.username,
                'last_login_time': data.reg_time,
            };
            await this.session('webuser', wx_userInfo);
            //成功后储存opid,防止无限登陆
            await this.session('wx_openid', data.openid);
            this.cookie('wx_openid', null);
            return this.success({ name: "绑定成功", url: "/uc/index" });


        }
        /**登录绑定 */
    async logonbindingAction() {
            let data = this.post();
            //console.log(data);
            let username = this.post('username');
            let password = this.post('password');
            password = encryptPassword(password);
            console.log(data);

            let res = await this.model("member").signin(username, password, this.ip(), 5, 0);
            if (0 < res.uid) {
                //记录用户登录行为
                // await this.model("action",).log("user_login", "member", res.uid, res.uid, this.ip(), this.http.url);
                //console.log(11111111111111);
                let wx_info = await this.model("wx_user").where({ openid: data.openid }).find();
                await this.model("wx_user").where({ openid: data.openid }).update({ uid: res.uid });
                //更新微信头像
                let filePath = think.RESOURCE_PATH + '/upload/avatar/' + res.uid;
                think.mkdir(filePath)
                await this.spiderImage(data.headimgurl, filePath + '/avatar.png')
                res.username = wx_info.nickname;
                await this.session('webuser', res);
                //成功后储存opid,防止无限登陆
                await this.session('wx_openid', data.openid);
                this.cookie('wx_openid', null);
                //TODO 用户密钥
                return this.success({ name: "绑定成功", url: "/uc/index" });
            } else { //登录失败
                let fail;
                switch (res) {
                    case -1:
                        fail = '用户不存在或被禁用';
                        break; //系统级别禁用
                    case -2:
                        fail = '密码错误';
                        break;
                    default:
                        fail = '未知错误';
                        break; // 0-接口参数错误（调试阶段使用）
                }
                this.fail(fail);
            }
        }
        /**
         * 更新微信头像
         */
    spiderImage(imgUrl, filePath) {
            let deferred = think.defer();
            http.get(imgUrl, function(res) {
                var imgData = "";
                res.setEncoding("binary");
                res.on("data", function(chunk) {
                    imgData += chunk;
                });

                res.on("end", function() {
                    fs.writeFileSync(filePath, imgData, "binary");
                    deferred.resolve(filePath);
                });
            });
            return deferred.promise;
        }
        async tuokecopyAction() {

        // data: {
        //         "docid": did,
        //         "name": user_name.val(),
        //         "phone": user_phone.val(),
        //         // csrfmiddlewaretoken: $.cookie("csrftoken")
        //     }
        if (is_weixin(this.userAgent())) {
            let data = this.post();
            console.log(data);
            let openid = await this.session("wx_openid");
            
            //已是微信用户，

            let map = {
                openid: openid,
                docid: data.docid
            };
            let res = await this.model("doc_wxuser").where(map).find();
            console.log(res);
            if (!think.isEmpty(res)) {
                console.log("have---------" + res);
                return this.success({ status: 0, name: "用户已经报名!" });
                //已经报名
            } else {

                let mmap = {
                    openid: openid,
                    docid: data.docid,
                    status: 1,
                    create_time: new Date().valueOf()
                }
                console.log(mmap);
                res = await this.model("doc_wxuser").add(mmap);
                //报名人数+1
                let document = this.model('document');
                let info = await document.detail(data.docid);
                info.addnums++;
                console.log("info.nums" + info.addnums);
                //报名人数+1
                let doc = await document.updates(info);

                return this.success({ status: 0, name: "用户报名成功!" });
            }
        } else {
            //PC端
            let data = this.post();
            console.log(data);
            let islogin = await this.islogin();
            if (!islogin) {
                //未登录，提示登录
                return this.success({ status: -1, name: "请先登录，谢谢参与" });
            }
            console.log("islogn----------" + islogin);
            let document = this.model('document');
            let info = await document.detail(data.docId);
            // console.log("tuoke info------"+JSON.stringify(info));
            if(info.uid==islogin){
                return this.success({ status: 0, name: "您已经拥有该拓客模板!" });
            }
            info.uid=islogin;
            info.id=null;
            info.create_time=null;
            info.position=0;
            let cname=data.cname;
            let mytuokeid=await this.model('category').where({name:cname}).find();
            console.log("mytuokeid.id==================="+mytuokeid.id);
            info.category_id=mytuokeid.id;//我的拓客模板
            // console.log("tuoke info------"+JSON.stringify(info));
            let res = await document.updates(info);
            // // let openid = await this.model("wx_user").where({ uid: islogin }).getField('openid');
            // // console.log("openid----------" + openid);
            // // if (think.isEmpty(openid)) {
            // //     return this.success({ status: -1, name: "请先关注微信公众号，谢谢参与" });
            // // }
            // let mmap = {
            //     openid: openid[0],
            //     docid: data.docid,
            //     status: 1,
            //     create_time: new Date().valueOf()
            // }
            // console.log(mmap);
            // await this.model("doc_wxuser").add(mmap);
            // await this.model("wx_user").where({ openid: openid[0] }).update({ phone: data.phone });

            // let document = this.model('document');
            // let info = await document.detail(data.docid);
            // info.addnums++;
            // console.log("info.nums" + info.addnums);
            // //报名人数+1
            // let doc = await document.updates(info);
            // console.log("info.nums doc -----"+doc);
            return this.success({ status: 0, name: "拓客模板拷贝成功!" });
        }
        return this.success({ status: -1, name: "用户报名失败!" });
    }
        //报名
    async enrollAction() {

        // data: {
        //         "docid": did,
        //         "name": user_name.val(),
        //         "phone": user_phone.val(),
        //         // csrfmiddlewaretoken: $.cookie("csrftoken")
        //     }
        if (is_weixin(this.userAgent())) {
            let data = this.post();
            console.log(data);
            let openid = await this.session("wx_openid");
            
            //已是微信用户，

            let map = {
                openid: openid,
                docid: data.docid
            };
            let res = await this.model("doc_wxuser").where(map).find();
            console.log(res);
            if (!think.isEmpty(res)) {
                console.log("have---------" + res);
                return this.success({ status: 0, name: "用户已经报名!" });
                //已经报名
            } else {

                let mmap = {
                    openid: openid,
                    docid: data.docid,
                    status: 1,
                    create_time: new Date().valueOf()
                }
                console.log(mmap);
                res = await this.model("doc_wxuser").add(mmap);
                //报名人数+1
                let document = this.model('document');
                let info = await document.detail(data.docid);
                info.addnums++;
                console.log("info.nums" + info.addnums);
                //报名人数+1
                let doc = await document.updates(info);

                return this.success({ status: 0, name: "用户报名成功!" });
            }
        } else {
            //PC端
            let data = this.post();
            console.log(data);
            let islogin = await this.islogin();
            if (!islogin) {
                //未登录，提示登录
                return this.success({ status: -1, name: "请先登录，谢谢参与" });
            }
            console.log("islogn----------" + islogin);
            let openid = await this.model("wx_user").where({ uid: islogin }).getField('openid');
            console.log("openid----------" + openid);
            if (think.isEmpty(openid)) {
                return this.success({ status: -1, name: "请先关注微信公众号，谢谢参与" });
            }
            let mmap = {
                openid: openid[0],
                docid: data.docid,
                status: 1,
                create_time: new Date().valueOf()
            }
            console.log(mmap);
            await this.model("doc_wxuser").add(mmap);
            await this.model("wx_user").where({ openid: openid[0] }).update({ phone: data.phone });

            let document = this.model('document');
            let info = await document.detail(data.docid);
            info.addnums++;
            console.log("info.nums" + info.addnums);
            //报名人数+1
            let doc = await document.updates(info);
            // console.log("info.nums doc -----"+doc);
            return this.success({ status: 0, name: "用户报名成功!" });
        }
        return this.success({ status: -1, name: "用户报名失败!" });
    }

    async tuokeAction() {
        let uurl = "http://www.gzxinbibo.com" + this.http.url;
        console.log("url-------------" + uurl);
        
        if (is_weixin(this.userAgent())) {
            await this.oauthAction();
            let aa = function(jssdk, url) {
                let deferred = think.defer();
                jssdk.getSignPackage(url, (err, signPackage) => {
                    if (!think.isEmpty(signPackage)) {
                        deferred.resolve(signPackage);
                    } else {
                        console.error(err);
                    }
                });
                return deferred.promise;
            }
            let signPackage = await aa(this.jssdk, uurl);
            console.log(signPackage);
            this.assign("signPackage", signPackage);
        }

        let id = this.get("id");
        console.log("id=========="+id);
        let document = this.model('document');
        let info = await document.detail(id);
        this.assign("docid", id);
        let islogin = await this.islogin();
        
        let str = info.content;
        if (!think.isEmpty(str)) {
            let img;
            if (checkMobile(this.userAgent())) {
                //手机端
                img = image_view(str, 640, 4);
            } else {
                //pc端

                img = image_view(str, 847, 0);
            }
            info.content = img
        }
        //console.log(info);
        //分类信息
        let cate = await this.category(info.category_id);
        cate = think.extend({}, cate);
        //seo
        this.meta_title = info.title; //标题
        this.keywords = info.keyname ? info.keyname : ''; //seo关键词
        this.description = info.description ? info.description : ""; //seo描述
        //keywords
        let keywords;
        if (!think.isEmpty(info.keyname)) {
            keywords = (info.keyname).split(",");
        }
        this.assign("keywords", keywords);
        //访问统计
        await document.where({ id: info.id }).increment('view');
        //外链
        // if (!think.isEmpty(info.link_id) && info.link_id != 0) {
        //     return this.redirect(info.link_id);
        // }
        // 获取面包屑信息
        // let breadcrumb = await this.model('category').get_parent_category(cate.id, true);
        // this.assign('breadcrumb', breadcrumb);

        // 上一篇
        // let previous = await document.where({ id: ['>', info.id], category_id: info.category_id, 'pid': 0, 'status': 1 }).order('id DESC').find();
        // this.assign('previous', previous)
        //     // 下一篇
        // let next = await document.where({ id: ['<', info.id], category_id: info.category_id, 'pid': 0, 'status': 1 }).order('id DESC').find();
        // this.assign('next', next)

        //获取模板
        let temp;
        let model = await this.model('model').get_model(info.model_id, 'name');
        console.log("model-------"+JSON.stringify( model));
        // 详情模版 TODO
        // 手机版模版

        this.assign('category', cate);
       // console.log(info);
        // 目录/文章/段落
        let pid;
        let pinfo;
        if (info.pid != 0) {
            let i = info.id;
            //
            while (i != 0) {
                let nav = await document.where({ id: i }).find();
                if (nav.pid == 0) {
                    pinfo = nav;
                    pid = nav.id;
                }
                i = nav.pid;
            }

        } else {
            pinfo = info;
            pid = info.id;
        }
        // 获取最后更新时间
        let lastinfo = await document.where({ topid: pid }).order("update_time DESC").find();
        //console.log(lasttime);
        this.assign("lastinfo", lastinfo);
        console.log(pid);
        let plist = await document.where({ pid: pid }).order("level DESC").select();
        this.assign("pinfo", pinfo);
        this.assign("plist", plist);
        //console.log(plist);
        if (plist[0]) {
            //let lastlevel = plist[0].level;
            //console.log(lastlevel);
            this.assign("lastlevel", plist[0]);
        }
        console.log(plist);
        // 文档无限级目录
        let ptree_ = await document.where({ topid: pid }).field('id,title,pid,name,level as sort').select();
        let ptree = get_children(ptree_, pid, 1);
        //console.log(ptree);
        this.assign('topid', pid);
        this.assign("ptree", ptree);

        // 如果是目录并且模板为空,模块为视频时，目录id，显示最后更新的主题
        if (info.type == 1 && (think.isEmpty(info.template) || info.template == 0) && info.model_id == 6) {
            if (plist[0]) {
                console.log(111111);
                let model_id = plist[0].model_id;
                let p_id = plist[0].id;
                let table = await this.model("model").get_table_name(model_id);
                let p_info = await this.model(table).find(p_id);
                info = think.extend(info, p_info);

            }
        }
        info.fmurl = await get_cover2(info.fmurl, this.setup.QINIU_DOMAIN_NAME);
        // console.log("tuoke.  pic---------" + JSON.stringify(pic));
        // info.fmurl = 'http://' + this.setup.QINIU_DOMAIN_NAME + '/' + pic.path;
        info.twourl = await get_cover2(info.twourl, this.setup.QINIU_DOMAIN_NAME);
        // info.twourl = '//' + this.setup.QINIU_DOMAIN_NAME + '/' + pic.path;
        // console.log("tuokeAction---------" + JSON.stringify(info));
        this.assign("info", info);
        //console.log("description-------------" + info.description);
        this.assign("desc", info.description);
        let openid;
        if (checkMobile(this.userAgent())) {
            //手机用户
            openid = await this.session("wx_openid");
            
            let map = {
                openid: openid,
                docid: id
            };
			
            if (typeof openid == 'undefined') {
                this.assign("pay_type", 0);
            } else {
                let res = await this.model("doc_wxuser").where(map).find();
                console.log(res);
                //是否已经报名
                if (res.openid != undefined) {
                    this.assign("pay_type", 1);
                } else {
                    //未报名
                    this.assign("pay_type", 0);
                }
            }
            //手机模版
            if (!think.isEmpty(info.template) && info.template != 0) {
                temp = info.template; //todo 已设置详情模板
            } else if (!think.isEmpty(cate.template_m_detail)) {
                temp = cate.template_m_detail; //分类已经设置模板
            } else {
                temp = model;
            }

            //内容分页
            if (!think.isEmpty(info.content)) {
                info.content = info.content.split("_ueditor_page_break_tag_");
            }
            console.log("tuokeAction 手机========" + `${this.http.controller}/${temp}`);
            return this.display(`mobile/${this.http.controller}/${temp}`);
        }
        if (!islogin) {
                //未登录，提示登录
                return this.success({ status: -1, name: "请先登录，谢谢参与" });
        }
        // PC用户
        let oid = await this.model("wx_user").where({ uid: islogin }).find();
        if (!think.isEmpty(oid)) {
            console.log("PC用户--------------" + oid);
            openid = oid.openid;
            let map = {
                openid: openid,
                docid: id
            };
            console.log("PC用户 oid,--------------" + JSON.stringify(map));
            let res = await this.model("doc_wxuser").where(map).find();
            //是否已经报名
            if (!think.isEmpty(res)) {
                this.assign("pay_type", 1);
            } else {
                //未报名
                this.assign("pay_type", 0);
            }
        } else {
            //未报名
            this.assign("pay_type", 0);
        }
        // if (!think.isEmpty(info.template) && info.template != 0) {
        //     temp = info.template; //已设置详情模板
        // } else if (!think.isEmpty(cate.template_detail)) {
        //     temp = cate.template_detail; //分类已经设置模板
        // } else {
        //     temp = model;
        // }
        // console.log(temp);
        //console.log(info);
        //内容分页
        if (!think.isEmpty(info.content)) {
            info.content = info.content.split("_ueditor_page_break_tag_");
        }

        // if(model=="myshop"){
        //     return this.display(`${this.http.controller}/myshop`);
        // }
        console.log("tuokeAction========" + `${this.http.controller}/${model}`);
        return this.display(`${this.http.controller}/${model}`);


    }
}
