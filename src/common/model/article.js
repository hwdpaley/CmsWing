// +----------------------------------------------------------------------
// | Bieber [ 美道网站内容管理框架 ]
// +----------------------------------------------------------------------
// | Copyright (c) 2015 http://www.gzxinbibo.com All rights reserved.
// +----------------------------------------------------------------------
// | Author: arterli <912697590@qq.com>
// +----------------------------------------------------------------------
'use strict';
/**
 * model
 */
export default class extends think.model.base {


    /**
     * 获取详情页数据
     * @param id
     * @returns {*}
     */
  async detail(id){
        //获取基础数据
      let info=await this.find(id);


      return info;
  }
}