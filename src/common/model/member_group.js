// +----------------------------------------------------------------------
// | Bieber [ 美道网站内容管理框架 ]
// +----------------------------------------------------------------------
// | Copyright (c) 2017 http://www.gzxinbibo.com All rights reserved.
// +----------------------------------------------------------------------
// | Author: arterli <912697590@qq.com>
// +----------------------------------------------------------------------
'use strict';
/**
 * model
 */
export default class extends think.model.base {
    /**
     * 获取用户组并进行缓存
     * @returns {Promise}
     */
   async getgroup(map={}){
       let list = await think.cache("all_member_group", () => {
           return this.select();
       }, {timeout: 365 * 24 * 3600});
       if(think.isEmpty(map)){
           return list;
       }else {
           return think._.filter(list, map);
       }
    }

}