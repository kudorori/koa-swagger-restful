module.exports = exports = {};

let getBody = (body, data) => {
//   console.log(body,data);
  switch(data.type){
    case "FIELD":{
      return body[data.key];
    }
    case "ARRAY":{
      return body[data.key][data.index];
    }
  }
}

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
    let model = ctx.collections.pop();
    if(populate != false){
      model = model.populate(populate);
    }
    let result = await model.exec();
//     console.log(result);
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
    ctx.findFields.push({
      key: key,
      type: "FIELD"
    });
    await next();
    console.log(`${key} findField Start`);
//     ctx.body = getBody(ctx.body,ctx.findFields.shift());
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

exports.getArrayItem = (key) => {
  return async(ctx, next) => {
    console.log(`${key} getArrayItem Wait`);
    ctx.findFields.push({
      key: key,
      type: "ARRAY",
      index: ctx.params.array_index
    });
    await next();
    console.log(`${key} getArrayItem Start`);
//     ctx.body = getBody(ctx.body,ctx.findFields.shift());
    ctx.body = ctx.body[key][ctx.params.array_index];
    console.log(`${key} getArrayItem End`);
  }
}

exports.create = (key) => {
  return async (ctx, next) => {
    await next();
    let model = new ctx.models[key](ctx.request.body);
    await model.save();
    ctx.body = model;
  }
}

exports.update = () => {
  return async (ctx, next) => {
    console.log("update");
  }
}

exports.delete = () => {
  return async (ctx, next) => {
    console.log("delete");
  }
}
