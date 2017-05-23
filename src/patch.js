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
      ctx.body = await model.update({
        _id: ctx.params._id
      },{
        $set: ctx.is("formData") ? ctx.request.body.fields : ctx.request.body
      });
    }
  }

  updateCollection(modelName){
    return async (ctx, next) => {
      await next();
      const {
        _force = false
      } = ctx.query;

      let query = {};
      console.log(ctx.query);
      for(let whereName in ctx.query){
        if(validate.params.private.test(whereName)){
          continue;
        }

        let value = ctx.query[whereName];
        let type = validate.where.find((item) => {
          return item.regex.test(value);
        });
        switch(type.type){
          case "IN":
            query[whereName] = {
              $in: value.substr(1, value.length-2).split(",")
            };
            break;
          case "LTE":
            query[whereName] = {
              $lte: value.substr(2)
            };
            break;
          case "LT":
            query[whereName] = {
              $lt: value.substr(1)
            };
            break;
          case "GT":
            query[whereName] = {
              $gt: value.substr(1)
            };
            break;
          case "GTE":
            query[whereName] = {
              $gte: value.substr(2)
            };
            break;
          case "REGEXP":
            query[whereName] = new RegExp(value.substr(1, (value.length-2)));
            break;
          default:
            query[whereName] = value;
            break;
        }
      }
      console.log(query);
      if(Object.keys(query).length > 0 || _force){
        let model = ctx.models[modelName];
        ctx.body = await model.updateMany(query, {
          $set: ctx.request.body
        });
      }else{
        throw {
          error: 0,
          text: "禁止無條件更新"
        }
      }
    }
  }

  __collection(modelName, definition){
    this.router.patch(`/${modelName}`, this.updateCollection(modelName));
    this.router.patch(`/${modelName}/:_id`, this.updateDocument(modelName));
  }

  build(){
    for(let key in this.definitions){
      this.__collection(key,this.definitions[key]);
    }
    return this.router.routes();
  }
}
