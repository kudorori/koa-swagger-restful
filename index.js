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

let buildRouter = (router, api) =>{
  for(let key in api.definitions){
    let model = api.definitions[key];
    router.get(`/${key}`,restful.find(key, api[key]));
    router.get(`/${key}/:${key}_id`,restful.findOne(key, api[key]));
    router.use(`/${key}/:${key}_id`,buildObjectSubRouter(key, model, api));
    /*

    router.post(`/${key}`,restful.create(key));
    
    
*/
  }
}

let buildObjectSubRouter = (name,model,api) => {
  let subRouter = new Router();
  
  let property = model.properties;
  for(let key in property){
    if(property[key].$ref!=undefined){
/*
      let ref = items.$ref.split("/").pop();
      subRouter.post(`/${key}`,restful.findOne(ref));
*/
    }else{
      //單取取得(沒做任何populate)
      subRouter.get(`/${key}`,restful.findField(key), restful.findOne(name));
      switch(property[key].type){
        case "object":{
          //取得內嵌物件 findOne => findField => findField...
          subRouter.use(`/${key}`,buildObjectSubRouter(key, property[key], api), restful.findOne(name));
          break;
        }
        case "array":{
          //取得內嵌陣列 findOne => findField
          subRouter.use(`/${key}`,buildArraySubRouter(key, property[key].items, api), restful.findOne(name));
          break;
        }
      } 
    } 
  }
  console.log(subRouter);
  return subRouter.routes();
}

let buildArraySubRouter = (name, items, api) => {
  let subRouter = new Router();
  if(items.$ref!=undefined){
//     let ref = items.$ref.split("/").pop();
//     subRouter.use("/:array_index",buildObjectSubRouter(api.definitions[ref]));
//     return subRouter.routes();
  }
  switch(items.type){
    case "object":{
      subRouter.use("/:array_index",buildObjectSubRouter(items));
      break;
    }
    case "array":{
      subRouter.use("/:array_index",buildArraySubRouter(items.items));
      break;
    }
    default:{
      subRouter.post("/",restful.pushArrayItem(name));
      subRouter.get("/:array_index",restful.getArrayItem(name));
      break;
    }
  }
  return subRouter.routes();
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
    return buildRouter(router, api);
  }).then(() => {
    
  }).catch(err => {
    console.log(err);
  })
  
  return router.routes();
}
