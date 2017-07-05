let base = require("./base");
const validate = require("./validate");

module.exports = class extends base{
  constructor(api){
    super();
    this.api = api;
    this.definitions = api.definitions;
  }

  updateDocument(modelName){
    return async (ctx, next) => {
      await next();
      let model = ctx.models[modelName];
      const body = ctx.is("multipart") ? ctx.request.body.fields : ctx.request.body;
      ctx.body = await model.update({
        _id: ctx.params._id
      }, body, {
        upsert: true,
        setDefaultsOnInsert: true
      });
    }
  }

  __collection(modelName, definition){
    this.router.put(`/${modelName}/:_id`, this.updateDocument(modelName));
  }

  build(){
    for(let key in this.definitions){
      this.__collection(key,this.definitions[key]);
    }
    return this.router.routes();
  }
}
