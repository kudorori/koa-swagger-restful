var _ = require("lodash");
var objPath = require("object-path");

module.exports = exports = {};

exports.bindModel = (key) => {
  
}
exports.populate = (key) => {
  return async (ctx, next) => {
    console.log(`${key} populate Wait`);
    ctx.populates.push({
      path: key
    });
    await next();
  }
}
exports.find = (key) => {
  return async (ctx, next) => {
    console.log(`${key} find Wait`);
    ctx.collections.push(ctx.models[key].find());
    await next();
    console.log(`${key} find Start`);
    console.log(`${key} find End`);
  }
}

exports.findOne = (key) => {
  return async (ctx, next) => {
    console.log(`${key} findOne Wait`);
    let id = ctx.params[`${key}_id`];
    ctx.collections.push(ctx.models[key].findOne().where("_id").equals(id));
    await next();
    console.log(`${key} findOne Start`)
    
    console.log(`${key} findOne End`);
  }
}

exports.exec = () => {
  return async (ctx, next) => {
    console.log("exec wait");
    await next();
    console.log("exec start");
    let populate = false;
    for(let item of ctx.populates.reverse()){
      if(populate == false){
        populate = item;
      }else{
        item.populate = populate;
        populate = item;
      }
    }
    console.log(populate);
    let model = ctx.collections.pop();
    if(populate != false){
      model = model.populate(populate);
    }
    let result = await model.exec();
    ctx._model = result;
    ctx.body = result;
    console.log("exec end");
  }
}
exports.findOneAndPopulation = () => {
  return async (ctx, next) => {
    await next();
    
  }
}

exports.findField = (key) => {
  return async(ctx, next) => {
    console.log(`${key} findField Wait`);
    await next();
    console.log(`${key} findField Start`);
    ctx.body = ctx.body[key];
    console.log(`${key} findField End`);
  }
}

exports.pushArrayItem = (key) => {
  return async(ctx, next) => {
    console.log(`${key} pushItem Wait`);
    await next();
    console.log(`${key} pushItem Start`);
    let data = ctx.body;
    data[key].push(ctx.request.body);
    await data.save();
    ctx.body = data[key];
    console.log(`${key} pushItem End`);
  }
}

exports.findArrayIndex = () => {
  return async(ctx, next) => {
    let index = ctx.params.array_index;
    console.log(`findArrayIndex ${index} Wait`);
    await next();
    console.log(`findArrayIndex ${index} Start`);
    ctx.body = ctx.body[index];
    console.log(`findArrayIndex ${index} End`);
  }
}

exports.preInsertMany = (key, paths) => {
  return async(ctx, next) => {
    console.log(`preInsertMany ${key} await`,paths);
    await next();
    console.log(`preInsertMany ${key} start`);
    
    let body = ctx.request.body;
    let saveQueue = [];
    let recu = (_flag, _paths) => {
      
      
      if(_flag == paths.length){ 
        let item = objPath.get(body, _paths);
        console.log(typeof(item));
        
        let model = new (ctx.models[key])(item);
        objPath.set(body, _paths, model._id);
        saveQueue.push(model);
        return ;
      }
      let newPath = [..._paths, paths[_flag].key];
      if(paths[_flag].type == "object"){
        recu(++_flag, newPath);
      }else if(paths[_flag].type == "array"){
        let items = objPath.get(body, newPath);
        console.log(body,newPath);
        for(let key in items){
          recu(++_flag, [...newPath, key]);
        }
      }
    }
    
    recu(0,[]);
    if(saveQueue.length>0){
      await ctx.models[key].insertMany(saveQueue);
    }
    console.log(`preInsertMany ${key} end`);
      
  }
}

exports.preCreate = (key, path) => {
  return async(ctx, next) => {
    console.log(`preCreate ${key} await`);
    await next();
    console.log(`preCreate ${key} start`);
    let item = objPath.get(ctx.request.body, path);
    let model = new (ctx.models[key])(item);
    await model.save();
    objPath.set(ctx.request.body, path, model._id);
    console.log(`preCreate ${key} end`);
  }
}

exports.create = (key) => {
  return async (ctx, next) => {
    console.log("create await");
    await next();
    console.log("create start");
    let body = ctx.request.body;
    let model = new ctx.models[key](body);
    await model.save();
    
    ctx.body = model;
    console.log("create end");
  }
}

exports.push = (key) => {
  return async (ctx, next) => {
    console.log("push await");
    await next();
    console.log("push start");
    let path = ctx.request.path.split("/").splice(3);
    let req_body = ctx.request.body;
    console.log(req_body);
    ctx.body[key].push(req_body);
    await ctx._model.save();
    ctx.body = ctx._model;
    console.log("push end");
  }
}

exports.update = (key) => {
  return async (ctx, next) => {
    console.log("update await");
    await next();
    console.log("update start");
    let id = ctx.params[`${key}_id`];
    let model = ctx.models[key];
    await model.update({
      _id: id
    },{
      $set: ctx.request.body
    });
    console.log("update end");
    ctx.body="OK";
  }
}

exports.delete = () => {
  return async (ctx, next) => {
    console.log("delete");
  }
}
