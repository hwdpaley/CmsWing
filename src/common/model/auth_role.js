// +----------------------------------------------------------------------
// | Bieber [ 美媒网站内容管理框架 ]
// +----------------------------------------------------------------------
// | Copyright (c) 2017 http://www.gzxinbibo.com All rights reserved.
// +----------------------------------------------------------------------
// | Author: Tony <912697590@qq.com>
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
   // async getgroup(map={}){
   //     let list = await think.cache("all_member_group", () => {
   //         return this.select();
   //     }, {timeout: 365 * 24 * 3600});
   //     if(think.isEmpty(map)){
   //         return list;
   //     }else {
   //         return think._.filter(list, map);
   //     }
   //  }
    async get_rolename(uid) {
        uid = uid || 0;
        //TODO 缓存处理续
        
        let role_id = await this.model('auth_user_role').where({user_id:uid}).field("role_id").find();
        let name=await this.field('desc').find(role_id.role_id);
        // console.log("get_rolename------"+JSON.stringify(role_id));
        return name.desc;

    }
}