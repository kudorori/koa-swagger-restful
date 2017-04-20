let base = require("./base");
let r = require("./restful");

module.exports = class extends base{
  constructor(api){
    super();
    this.api = api;
    this.definitions = api.definitions;
  }
  
  __array(prefix, key, items, pre = [], post = [], exclude = []){
    let path = `${prefix}/:array_index`
    let midd = [r.findArrayIndex()];
    if(items.$ref != undefined){
      let refName = items.$ref.split("/").pop();
      if(exclude.indexOf(refName) == -1){
        pre.push(r.populate(key));
        this.__document(path, this.definitions[refName].properties, pre, [...midd, ...post], [...exclude, refName]);
      }
    }
    switch(items.type){
      case "object":{
        this.__document(path, items.properties, pre, [...midd, ...post]);
      }
      case "array":{
        this.__array(path, items.items, pre, [...midd, ...post]);
      }
    }
    this.router.get(path,...[...pre, ...midd, ...post], r.exec());
  }
  
  __document(prefix, properties, pre=[], post=[], exclude = []){
    for(var key in properties){
      let path = `${prefix}/${key}`;
      let property = properties[key];
      let midd = [r.findField(key)];
      if(property.$ref != undefined){
        let refName = property.$ref.split("/").pop();
        if(exclude.indexOf(refName) == -1){
          midd.splice(0,0,r.populate(key));
          this.__document(path, this.definitions[refName].properties, pre, [...midd, ...post], [...exclude, refName]);
        }
      }
      
      switch(property.type){
        case "object":{
          this.__document(prefix,property.properties, pre, post);
          break;
        }
        case "array":{
          this.__array(`${prefix}/${key}`,key, property.items, pre, [...midd, ...post], exclude);
          break;
        }
      }
      this.router.get(path,...[...pre, ...midd, ...post], r.exec());
    }
  }
  
  __collection(key,definition){
    let path = `/${key}`;
    this.router.get(`${path}`, r.find(key), r.exec());
    this.router.get(`${path}/:${key}_id`, r.findOne(key),r.exec());
    this.__document(`${path}/:${key}_id`, definition.properties, [r.findOne(key)], [],[key]);
  }
  
  build(){
    for(let key in this.definitions){
      this.__collection(key,this.definitions[key]);
    }
    return this.router.routes();
  }
}
