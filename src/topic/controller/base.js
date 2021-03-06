// +----------------------------------------------------------------------
// | Bieber [ 美媒网站内容管理框架 ]
// +----------------------------------------------------------------------
// | Copyright (c) 2017 http://www.gzxinbibo.com All rights reserved.
// +----------------------------------------------------------------------
// | Author: Tony <912697590@qq.com>
// +----------------------------------------------------------------------

'use strict';
import API from 'wechat-api';
import JSSDK from '../../uc/controller/jssdk.js';
export default class extends think.controller.base {
    init(http) {
        super.init(http);

    }

    async __before() {
        this.setup = await this.model("setup").getset();
        this.api = new API(this.setup.wx_AppID, this.setup.wx_AppSecret);
        this.jssdk = JSSDK;
        //网站配置
        // console.log(this.setup);
        //当前登录状态
        this.is_login = await this.islogin();

        // let userInfo = await this.model("member").find(this.is_login);
        // console.log(userInfo);
        //判断公众账号类型?
        // if (is_weixin(this.userAgent())) {
        //     await this.oauthAction();
        //     let aa = function(jssdk, url) {
        //         let deferred = think.defer();
        //         jssdk.getSignPackage(url, (err, signPackage) => {
        //             if (!think.isEmpty(signPackage)) {
        //                 deferred.resolve(signPackage);
        //             } else {
        //                 console.error(err);
        //             }
        //         });
        //         return deferred.promise;
        //     }
        //     let signPackage = await aa(this.jssdk, uurl);
        //     console.log(signPackage);
        //     this.assign("signPackage", signPackage);
        // }

        // if (checkMobile(this.userAgent())) {
        //     if (is_weixin(this.userAgent())) {
        //         let uurl = this.setup.wx_url + this.http.url;
        //         await this.action("uc/weixin", "oauth");
        //         let weixin = function(jssdk, url) {
        //             let deferred = think.defer();
        //             jssdk.getSignPackage(url, (err, signPackage) => {
        //                 if (!think.isEmpty(signPackage)) {
        //                     deferred.resolve(signPackage);
        //                 } else {
        //                     console.error(err);
        //                 }
        //             });
        //             return deferred.promise;
        //         }
        //         let signPackage = await weixin(this.jssdk, uurl);
        //         console.log(signPackage);
        //         this.assign("signPackage", signPackage);
        //     }else{
        //         return think.statusAction(700, this.http);
        //     }
        // }
        // let userinfo=await this.session('userInfo');
        // console.log("__before----------,"+JSON.stringify(userinfo) );
        //关闭站点
        if (this.setup.WEB_SITE_CLOSE == 0) {
            let isshow = await this.session('userInfo');
            if (think.isEmpty(isshow)) {
                this.http.error = new Error('该网站已关闭，只有管理员可以正常访问');
                return think.statusAction(404, this.http);
            }
        }
        // let csrf = await this.session('__CSRF__');
        //  // console.log("__CSRF__-------------," + csrf);
        // await this.cookie('__CSRF__', csrf);
        // this.assign('csrf', csrf);
        //用户信息
        this.user = {};
        this.user.roleid = 8; //游客
        this.user.uid = 0;
        //访问控制
        if (this.is_login) {
            this.user.roleid = await this.model("member").where({ id: this.is_login }).getField('groupid', true);
        }
        this.user = think.extend(this.user, await this.session('webuser'));
        // console.log("__before----------," + JSON.stringify(this.user));
        this.assign("userInfo", this.user);

        //获取当前分类信息
        //console.log(action);
        // this.meta_title = cate.meta_title?cate.meta_title:cate.title;
        //设置主题
        //this.http.theme("default);
        //购物车
        //关闭商品模型时同时关闭购物车

        // if (!think.isEmpty(await this.model('model').get_model(4)) && this.http.action != "avatar") {
        //     let cartList = await this.shopCart();
        //     let cartInfo;
        //     if (think.isEmpty(cartList)) {
        //         cartInfo = {
        //             total: 0,
        //             num: 0,
        //             data: null
        //         }

        //     } else {

        //         let total = [];
        //         let num = [];
        //         for (let val of cartList) {
        //             total.push(val.price);
        //             num.push(val.qty);
        //             //判断是否有库存
        //             let stock = await this.model("order").getstock(val.product_id, val.type);

        //             if (val.qty > stock) {
        //                 val.stock = 0;
        //             } else {
        //                 val.stock = stock;
        //             }
        //         }
        //         cartInfo = {
        //             total: eval(total.join('+')),
        //             num: eval(num.join('+')),
        //             data: cartList
        //         }
        //     }
        //     this.cart = cartInfo;
        // }
    }
    /**
     * 判断是否登录
     * @returns {boolean}
     */
    async islogin() {
        //前台判断是否登录
        let user = await this.session('webuser');
        let res = think.isEmpty(user) ? false : user.uid;
        return res;

    }
    async weblogin() {
        let islogin = await this.islogin();
        console.log('weblogin--------');
        if (!islogin) {
            if (!is_weixin(this.userAgent())) {
                //判断浏览客户端
                if (checkMobile(this.userAgent())) {
                    //手机端直接跳转到登录页面
                    return this.redirect('/uc/public/login');
                } else {
                    //pc端跳转到错误页面
                    return this.redirect('/uc/public/login');
                    // return think.statusAction(700, this.http);
                }
            }
        }
    }

    //获取分类信息
    async category(id, field) {
        id = id || 0;
        field = field || "";
        if (think.isEmpty(id)) {
            //this.fail('没有指定数据分类！');
            this.http.error = new Error('没有指定数据分类！');
            return think.statusAction(702, this.http);
        }
        console.log("category-----------" + id + "," + field);
        let cate = await this.model("category").info(id, field);
        //console.log(cate);
        if (cate && 1 == cate.status) {

            switch (cate.display) {
                case 0:
                    //this.fail('该分类禁止显示')
                    this.http.error = new Error('该分类禁止显示！');
                    return think.statusAction(702, this.http);
                    break;
                    //TODO:更多分类显示状态判断
                default:

                    return cate;
            }

        } else {

            //this.fail("分类不存在或者被禁用！");
            this.http.error = new Error('分类不存在或者被禁用！');
            return think.statusAction(702, this.http);
        }
    }
    //购物车
    async shopCart() {
        let cartdata = null;
        if (this.is_login) {
            let loadata = await this.session("cart_goods_item");
            if (think.isEmpty(loadata)) {
                cartdata = await this.model('cart').where({ uid: this.user.uid }).select();
            } else {
                //loadata = JSON.parse(loadata);
                for (let val of loadata) {
                    val.uid = this.user.uid;
                    //验证原有的数据是否已经存在
                    let res = await this.model('cart').where({ product_id: val.product_id, type: val.type, uid: this.user.uid }).select();
                    //console.log(res);
                    if (!think.isEmpty(res)) {
                        val.qty = Number(val.qty) + Number(res[0].qty);
                        val.id = res[0].id;
                        await this.model('cart').update(val);
                    } else {
                        await this.model('cart').add(val);
                    }

                }
                await this.session("cart_goods_item", null);
                cartdata = await this.model('cart').where({ uid: this.user.uid }).select();
            }
        } else {
            cartdata = await this.session("cart_goods_item");
            // if(cartdata){
            // cartdata = JSON.parse(cartdata);
            // }
        }
        //console.log(cartdata);
        return cartdata;
    }

    /**
     * 处理文档列表显示
     * @param {array} list 列表数据
     * @param {integer} model_id 模型id
     */
    async parseDocumentList(list, model_id) {
        model_id = model_id || 1;
        let attrList = await this.model('attribute').get_model_attribute(model_id, false, 'id,name,type,extra');
        //attrList=attrList[model_id];
        //this.end(attrList);
        // console.log(attrList);
        if (think.isArray(list)) {
            list.forEach((data, k) => {
                //console.log(data);
                for (let key in data) {
                    //console.log(key)
                    if (!think.isEmpty(attrList[key])) {
                        let extra = attrList[key]['extra'];
                        let type = attrList[key]['type'];
                        //console.log(extra);
                        if ('select' == type || 'checkbox' == type || 'radio' == type || 'bool' == type) {
                            // 枚举/多选/单选/布尔型
                            let options = parse_config_attr(extra);
                            let oparr = Object.keys(options);
                            if (options && in_array(data[key], oparr)) {
                                data[key] = options[data[key]];
                            }
                        } else if ('date' == type) { // 日期型
                            data[key] = dateformat('Y-m-d', data[key]);
                        } else if ('datetime' == type) { // 时间型
                            data[key] = dateformat('Y-m-d H:i', data[key]);
                        } else if ('pics' === type) {
                            data[key] = `<span class="thumb-sm"><img alt="..." src="${data[key]}" class="img-responsive img-thumbnail"></span>`;
                        }
                    }
                }
                data.model_id = model_id;
                list[k] = data;
            })
            //console.log(222)
            return list;
        }
    }
    //跨域设置
    setCorsHeader() {
        this.header("Access-Control-Allow-Origin", this.header("origin") || "*");
        this.header("Access-Control-Allow-Headers", "x-requested-with");
        this.header("Access-Control-Request-Method", "GET,POST,PUT,DELETE");
        this.header("Access-Control-Allow-Credentials", "true");
    }

}