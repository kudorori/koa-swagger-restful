let base = require("./base");
let r = require("./restful");

module.exports = class extends base{
  constructor(api){
    super();
    this.api = api;
    this.definitions = api.definitions;
  }
  
  
  __collection(key,definition){
    let path = `/${key}`;
    this.router.patch(`${path}/:${key}_id`,r.update(key));
  }
  
  build(){
    for(let key in this.definitions){
      this.__collection(key,this.definitions[key]);
    }
    return this.router.routes();
  }
}
