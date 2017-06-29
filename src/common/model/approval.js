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
     * 添加审核
     * @param model
     * @param uid
     * @param title
     * @param data
     * @returns {Promise}
     */
  async adds(model,uid,title,data){
      let res = await this.add({model:model,uid:uid,title:title,data:JSON.stringify(data),time:new Date().getTime()});
      return res;
  }
}