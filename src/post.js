let base = require("./base");
/*
  post:
  * 新增 document
  * document push array
*/
module.exports = class extends base{
  constructor(api){
    super();
    this.api = api;
    this.definitions = api.definitions;
  }

  getDocument(modelName){
    return async(ctx, next) => {
      console.log("get document wait");
      await next();
      let query = {_id: ctx.params._id};
      ctx.body = await ctx.models[modelName].findOne(query).exec();
      console.log("get document end");
    }
  }

  addDocument(modelName){
    return async(ctx, next) => {
      console.log("addDocument wait");
      await next();
      const body = ctx.is("multipart") ? ctx.request.body.fields : ctx.request.body;
      if(!Array.isArray(body)){
        let model = new (ctx.models[modelName])(body);
        ctx.body = await model.save();
      }else{
        let model = ctx.models[modelName];
        ctx.body = await model.insertMany(body);
      }

      console.log("addDocument end");
    }
  }

  pushDocumentOfArray(fieldName, definition){
    return async(ctx, next) => {
      console.log("push array wait");
      await next();
      let body =  ctx.is("multipart") ? ctx.request.body.fields : ctx.request.body;

      if(definition.items.$ref != undefined && typeof(body) == "object"){
        let model = new (ctx.models[definition.items.$ref.split("/").pop()])(body);
        await model.save();
        body = model._id;
      }

      ctx.body[fieldName].push(body);
      ctx.body = await ctx.body.save();
      console.log("push array end");
    }
  }

  __collection(modelName, definition){
    this.router.post(`/${modelName}`, this.addDocument(modelName));
    for(const fieldName in definition.properties){
      const fieldDefinition = definition.properties[fieldName];
      if(fieldDefinition.type == "array"){
        this.router.post(`/${modelName}/:_id/${fieldName}`, this.pushDocumentOfArray(fieldName, fieldDefinition), this.getDocument(modelName));
      }
    }
  }

  build(){
    for(let key in this.definitions){
      this.__collection(key,this.definitions[key]);
    }
    return this.router.routes();
  }
}
