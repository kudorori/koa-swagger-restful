let SwaggerParser = require('swagger-parser');
let Router = require("koa-router");
let restful = require("./restful.js");
let getMethod = require("./get.js");
let postMethod = require("./post.js");
let patchMethod = require("./patch.js");
let deleteMethod = require("./delete.js");

let parseAPI = (path) =>{
  return SwaggerParser.validate(path,{
		$refs: {
		    internal: false   // Don't dereference internal $refs, only external
		}
	})
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
    const basePath = `${api.basePath}/models`;
    console.log("koa-swagger-restful:: PARSE API SUCCESS");
    router.use(basePath, new getMethod(api).build());
    router.use(basePath, new postMethod(api).build());
    router.use(basePath, new patchMethod(api).build());
    router.use(basePath, new deleteMethod(api).build());
  }).then(() => {
    
  }).catch(err => {
    console.log(err);
  })
  
  return router.routes();
}
