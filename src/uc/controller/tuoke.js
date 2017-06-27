// +----------------------------------------------------------------------
// | Bieber [ 美媒网站内容管理框架 ]
// +----------------------------------------------------------------------
// | Copyright (c) 2017 http://www.gzxinbibo.com All rights reserved.
// +----------------------------------------------------------------------
// | Author: Tony <912697590@qq.com>
// +----------------------------------------------------------------------
'use strict';

import Base from './base.js';

export default class extends Base {
    /**
     * index action
     * @return {Promise} []
     */
    indexAction() {
        //auto render template file index_index.html
        return this.display();
    }
    async snAction() {
        // let date = new Date();
        // let y = date.getFullYear();
        // let m = date.getMonth()+1 <10 ?"0"+(date.getMonth()+1):date.getMonth()+1;
        // let d = date.getDate()<10?"0"+date.getDate():date.getDate();
        // let v_timestr = y+m+d;
        let prefix = think.parseConfig(true, think.config("db")).prefix;
        let oo = await this.model().query(`call seq_no(1)`); //TODO
        // let order_no= await this.query(`SELECT CONCAT(${v_timestr},LPAD(order_sn,7,0)) AS order_sn FROM cmswing_order_seq WHERE timestr=${v_timestr}`);
        this.end(oo[0][0]["order_sn"])
    }

        /**
         * 
         */
    async tuokeAction() {
        let id = this.get("id").split("||");
        let document = this.model('document');
        let info = await document.detail(id);
        this.assign("docid", id);

        /* 页码检测*/
        //TODO
        let roleid = 8; //游客
        //访问控制
        let islogin =await this.islogin();;
        // console.log("login--------"+JSON.stringify(islogin));
        if (islogin) {
            roleid = await this.model("member").where({ id: islogin }).getField('groupid', true);
        }
        if(roleid==8){
          this.http.error = new Error('您尚未登录，请先登录！');
          return think.statusAction(700, this.http);
        }
        // if(info.uid!=1){
        //   if(info.uid!=islogin){
        //     this.http.error = new Error('无查看权限！');
        //     return think.statusAction(700, this.http);
        //   }
        // }
        // // console.log("info.category_id----------" + info.category_id + "," + info.uid + "," + islogin);
        // let priv = await this.model("category_priv").priv(info.category_id, roleid, 'visit');
        // if(!priv){
        //   this.http.error = new Error('您所在的用户组,禁止访问本栏目！');
        //   return think.statusAction(700, this.http);
        // }
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
        if (!think.isEmpty(info.link_id) && info.link_id != 0) {
            return this.redirect(info.link_id);
        }
        //获取面包屑信息
        let breadcrumb = await this.model('category').get_parent_category(cate.id, true);
        this.assign('breadcrumb', breadcrumb);

        // 上一篇
        let previous = await document.where({ id: ['>', info.id], category_id: info.category_id, 'pid': 0, 'status': 1 }).order('id DESC').find();
        this.assign('previous', previous)
            // 下一篇
        let next = await document.where({ id: ['<', info.id], category_id: info.category_id, 'pid': 0, 'status': 1 }).order('id DESC').find();
        this.assign('next', next)

        //获取模板
        let temp;
        let model = await this.model('model').get_model(info.model_id, 'name');

        //详情模版 TODO
        //手机版模版

        this.assign('category', cate);
        //console.log(info);
        //目录/文章/段落
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
        //获取最后更新时间
        let lastinfo = await document.where({ topid: pid }).order("update_time DESC").find();
        //console.log(lasttime);
        this.assign("lastinfo", lastinfo);
        //console.log(pid);
        let plist = await document.where({ pid: pid }).order("level DESC").select();
        this.assign("pinfo", pinfo);
        this.assign("plist", plist);
        //console.log(plist);
        if (plist[0]) {
            //let lastlevel = plist[0].level;
            //console.log(lastlevel);
            this.assign("lastlevel", plist[0]);
        }
        //console.log(plist);
        //文档无限级目录
        let ptree_ = await document.where({ topid: pid }).field('id,title,pid,name,level as sort').select();
        let ptree = get_children(ptree_, pid, 1);
        //console.log(ptree);
        this.assign('topid', pid);
        this.assign("ptree", ptree);

        //如果是目录并且模板为空,模块为视频时，目录id，显示最后更新的主题
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
        if (checkMobile(this.userAgent())) {
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
            return this.display(`mobile/${this.http.controller}/${temp}`)
        } else {
            if (!think.isEmpty(info.template) && info.template != 0) {
                temp = info.template; //已设置详情模板
            } else if (!think.isEmpty(cate.template_detail)) {
                temp = cate.template_detail; //分类已经设置模板
            } else {
                temp = model;
            }
            // console.log(temp);
            //console.log(info);
            //内容分页
            if (!think.isEmpty(info.content)) {
                info.content = info.content.split("_ueditor_page_break_tag_");
            }
        }
        let pic = await get_cover(info.fmurl);
        console.log("tuoke.  pic---------" + JSON.stringify(pic));
        info.fmurl = '//' + this.setup.QINIU_DOMAIN_NAME + '/' + pic.path;
        pic = await get_cover(info.twourl);
        info.twourl = '//' + this.setup.QINIU_DOMAIN_NAME + '/' + pic.path;
        // console.log("tuokeAction---------" + JSON.stringify(info));
        this.assign("info", info);
        let openid ='oXJPVwN4JY0Y3fAVDuvl3EWh2_uQ';// await this.session("wx_openid");

        let map = {
                openid: openid,
                docid:id
        };
        let res = await this.model("doc_wxuser").where(map).find();
        //是否已经报名
        if(res.openid!=undefined){
          this.assign("pay_type", 1);
        }else{
          this.assign("pay_type", 0);
        }
        
        console.log("tuokeAction========"+`${this.http.controller}/${this.http.action}`);
        if (checkMobile(this.userAgent())) {
            //手机模版
            return this.display(`mobile/${this.http.controller}/${this.http.action}`)
        } else {
            return this.display();
        }

    }
}
