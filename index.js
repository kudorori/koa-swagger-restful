let SwaggerParser = require('swagger-parser');
let Router = require("koa-router");
let restful = require("./restful.js");


let parseAPI = (path) =>{
  return SwaggerParser.validate(path,{
		$refs: {
		    internal: false   // Don't dereference internal $refs, only external
		}
	})
}


let documentRouter = class {
  constructor(prefix,collection,properties,definitions,preEvent = [],postEvent = []){
    this.prefix = prefix;
    this.collectionName = collection;
    this.properties = properties;
    this.definitions = definitions;
    this.preEvent = preEvent.length == 0 ? [] : preEvent;
    this.postEvent = postEvent.length == 0 ? [] : postEvent;
  }
  build(){
    let path = this.prefix;
    let subRouter = new Router();
    subRouter.get(`${path}`,...this.preEvent, ...this.postEvent, restful.exec());
//     subRouter.patch(`${path}`,...this.patch());
//     subRouter.put(`${path}`,...this.put());
//     subRouter.delete(`${path}`,...this.del());
    for(let key in this.properties){
      let property = this.properties[key];
      let $ref = property.$ref;
      let type = property.type;
      let subPath = `${path}/${key}`;
      if($ref != undefined){
        let refName = $ref.split("/").pop();
        let refDoc = this.definitions[refName];
        if(refDoc.properties!=undefined){
          let dr = new documentRouter(
                        subPath,
                        this.collectionName,
                        refDoc.properties,
                        this.definitions,
                        [...this.preEvent, restful.populate(key)],
                        [restful.findField(key), ...this.postEvent]
                      );
          subRouter.use("",dr.build().routes());
        }
        continue;
      }
      
      switch(type){
        case "object":{
          break;
        }
        case "array":{
          let array_path = `${subPath}/:array_index`;
          subRouter.get(subPath, ...this.preEvent, ...[restful.populate(key),restful.findField(key)], ...this.postEvent, restful.exec());
          if(property.items.$ref != undefined){
            let refName = property.items.$ref.split("/").pop();
            let refDoc = this.definitions[refName];
              
              
            subRouter.use("",dr.build().routes());
            continue;
          }
          switch(property.items.type){
            case "object":{
              
            }
            case "array":{
              
            }
            default:{
              subRouter.get(array_path, ...this.preEvent, restful.getArrayItem(key), ...this.postEvent, restful.exec());
            }
          }
          break;
        }
        default:{
          subRouter.get(subPath, ...this.preEvent, restful.findField(key), ...this.postEvent, restful.exec());
//           subRouter.patch(subPath, ...this.preEvent, ...this.updateField(key));
//           subRouter.delete(subPath, ...this.preEvent, ...this.delField(key));
          break;
        }
      }
    }
    return subRouter;
  }
}


let collectionRouter = class {
  constructor(collection,definition,definitions){
    this.collectionName = collection;
    this.definition = definition;
    this.definitions = definitions;
  }
  build(){
    let subRouter = new Router();
    let path = `/${this.collectionName}`;
    
    subRouter.get(path,...this.find());
    subRouter.post(path,...this.create());
    
    let dr = new documentRouter(
      `${path}/:${this.collectionName}_id`,
      this.collectionName,
      this.definition.properties,
      this.definitions,
      [restful.findOne(this.collectionName)]);
    subRouter.use("",dr.build().routes());
//     console.log(subRouter);
    return subRouter;
  }
  find(){
    return [restful.find(this.collectionName),restful.exec()];
  }
  
  create(){
    return [];
  }
  patch(){
    return [];
  }
  put(){
    return [];
  }
  del(){
    return [];
  }
}

let buildRouter = class {
  constructor(router,api){
    this.router = router;
    this.api = api;
  }
  async build(){
    for(let key in this.api.definitions){
      let definition = this.api.definitions[key];
      let cr = new collectionRouter(key,definition,this.api.definitions);
      this.router.use("",cr.build().routes());
    }
    return this.router.routes();
  }
}

module.exports = exports = function({
  path=false
}){
  if(path==false){
    console.error("koa-swagger-restful:: PATH ERROR");
    return;
  }
  let router = new Router();
  
  parseAPI(path).then(api => {
    console.log("koa-swagger-restful:: PARSE API SUCCESS");
    console.log(api.definitions);
    let b = new buildRouter(router,api);
    return b.build();
  }).then((routes) => {
//     console.log(routes);
//     router.use(routes);
  }).catch(err => {
    console.log(err);
  })
  
  return router.routes();
}
