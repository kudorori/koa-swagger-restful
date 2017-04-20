let base = require("./base");
let r = require("./restful");

module.exports = class extends base{
  constructor(api){
    super();
    this.api = api;
    this.definitions = api.definitions;
  }
  
  __document(prefix, properties, pre=[], post=[], exclude = []){
    let bind = async(ctx, next) => {
      await next();
      ctx.request.body = ctx.body._id;
    };
    for(var key in properties){
      let path = `${prefix}/${key}`;
      let property = properties[key];
      switch(property.type){
        case "array":{
          if(property.items.$ref != undefined){
            let refName = property.items.$ref.split("/").pop();
            if(exclude.indexOf(refName) == -1){
              this.router.post(path, ...pre, r.push(key), r.exec(), bind, r.create(refName));
            }
          }else{
            this.router.post(path, ...pre, r.push(key), r.exec());
          }
          break;
        }
      }
    }
  }
  
  
  __getPre(properties, path = [], exclude = []){
    let result = [];
    for(var key in properties){
      let property = properties[key];
      if(property.$ref != undefined){
        let refName = property.$ref.split("/").pop();
        if(exclude.indexOf(refName) == -1){
          let _path = [...path, {key: key, type: "object"}];
          result.push(r.preCreate(refName, _path));
          result = [...result, ...this.__getPre(this.definitions[refName].properties, _path, [...exclude, refName])];
        }
        
      }
      
      if(property.type == "array" && property.items.$ref != undefined){
        if(property.items.$ref != undefined){
          let refName = property.items.$ref.split("/").pop();
          if(exclude.indexOf(refName) == -1){
            let _path = [...path, {key: key, type: "array"}];
            result.push(r.preInsertMany(refName, _path));
            result = [...result, ...this.__getPre(this.definitions[refName].properties, _path, [...exclude, refName])];
          }
        }
      }
    }
    return result;
  }
  
  __collection(key,definition){
    let path = `/${key}`;
    this.router.post(`${path}`,r.create(key), ...this.__getPre(definition.properties, [], [key]));
    
    this.__document(`${path}/:${key}_id`, definition.properties, [r.findOne(key)], [], [key]);
  }
  
  build(){
    for(let key in this.definitions){
      this.__collection(key,this.definitions[key]);
    }
    return this.router.routes();
  }
}
