// +----------------------------------------------------------------------
// | Bieber [ 美道网站内容管理框架 ]
// +----------------------------------------------------------------------
// | Copyright (c) 2015 http://www.gzxinbibo.com All rights reserved.
// +----------------------------------------------------------------------
// | Author: arterli <912697590@qq.com>
// +----------------------------------------------------------------------
'use strict';
/**
 * logic
 * @param  {} []
 * @return {}     []
 */
export default class extends think.logic.base {
  /**
   * index action logic
   * @return {} []
   */
  indexAction(){

  }

  updateAction(){
    this.rules = {
      name:"alphaNumericDash",
      title:"required|maxLength:80",
      group_id:"int|default:0",

    }
  }
}
