let base = require("./base");

const privateRegex = new RegExp(/^_[\w]*/);
const isRegExpValue = new RegExp(/\/[\w\s]*\//);


const validateRegex = [{
  type: "REGEXP",
  regex: new RegExp(/^\/[\w\s]*\/$/)
},{
  type: "OR",
  regex: new RegExp(/^\[or\][\w\s]*/)
},{
  type: "IN",
  regex: new RegExp(/^\[[\w\s\,]*\]$/)
},{
  type: "GTE",
  regex: new RegExp(/^>=[\w\s]*/)
},{
  type: "GT",
  regex: new RegExp(/^>[\w\s]*/)
},{
  type: "LTE",
  regex: new RegExp(/^<=[\w\s]*/)
},{
  type: "LT",
  regex: new RegExp(/^<[\w\s]*/)
},{
  type: "GENERAL",
  regex: new RegExp(/./)
}]
module.exports = class extends base{
  constructor(api){
    super();
    this.api = api;
    this.definitions = api.definitions;
  }
  
  
  /*
    對每個 collection 新增 get 方法 
  */
  __collection(modelName, definition){
    /*
      get collection (/users)
    */
    this.router.get(`/${modelName}`, this.getCollection(modelName))
    this.router.get(`/${modelName}/:_id`, this.getDocument(modelName))
    for(const fieldName in definition.properties){
      const fieldDefinition = definition.properties[fieldName];
      this.router.get(`/${modelName}/:_id/${fieldName}`, this.getDocumentOfField(fieldName), this.getDocument(modelName));
      if(fieldDefinition.type == "array"){
        console.log(fieldName, fieldDefinition);
        this.router.get(`/${modelName}/:_id/${fieldName}/:_arrayIndex`,this.getDocumentOfFieldArray(), this.getDocumentOfField(fieldName), this.getDocument(modelName));
      }
    }
  }
  
  getDocument(modelName){
    return async (ctx, next) => {
      console.log("get document wait");
      await next();
      let query = {_id: ctx.params._id};
      let { 
        _select = "",  
        _populate=""
      } = ctx.query;
      ctx.body = await ctx.models[modelName].findOne(query).select(_select).populate(_populate).exec();
      console.log("get document end");
    }
  }
  
  getDocumentOfField(fieldName){
    return async (ctx, next) => {
      console.log("get field wait");
      await next();
      console.log(ctx.body, fieldName);
      ctx.body = ctx.body[fieldName];
      console.log("get field end");
    }
  }
  
  getDocumentOfFieldArray(){
    return async (ctx, next) => {
      console.log("get array wait");
      await next();
      ctx.body = ctx.body[ctx.params._arrayIndex];
      console.log("get array end");
    }
  }
  
  
  /*
    處理query collection
    * 條件查詢
    * pagination
    * regexp
    * ><=
    * in
    
    TODO:
      or (ex: $or = {object?} | ([or][whereName] = ???)
      
  */
  getCollection(modelName){
    return async (ctx, next) => {
      await next();
      let {
        _count = false, 
        _skip = 0, 
        _limit = 100, 
        _select = "", 
        _sort = "", 
        _populate="",
        _query = false
      } = ctx.query;
      let model = ctx.models[modelName];
      let query = {};
      
      for(let whereName in ctx.query){
        if(!privateRegex.test(whereName)){
          let value = ctx.query[whereName];
          let type = validateRegex.find((item) => {
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
      }
      let result = [];
      if(_count){
        result = await model.count();
      }else{
        result = {
          items: await model.find(query).populate(_populate).select(_select).limit(parseInt(_limit)).skip(parseInt(_skip)).sort(_sort),
          count: await model.find(query).count() 
        };
      }
      ctx.body = result;
    }
  }
  
  
  
  build(){
    for(let key in this.definitions){
      this.__collection(key, this.definitions[key]);
    }
    return this.router.routes();
  }
}
