module.exports = exports = {};

exports.bindModel = (collections) => {
  
}

exports.find = (collections,schema) => {
  return async (ctx, next) => {
    console.log(`${collections} find Wait`);
    await next();
    console.log(`${collections} find Start`);
    let result = await ctx.models[collections].find();
    ctx.body = result;
    console.log(`${collections} find End`);
  }
}

exports.findOne = (collections) => {
  return async (ctx, next) => {
    console.log(`${collections} findOne Wait`);
    await next();
    console.log(`${collections} findOne Start`)
    let id = await ctx.params[`${collections}_id`];
    let result = await ctx.models[collections].findOne({
      _id: id
    });
    ctx.body = result;
    console.log(`${collections} findOne End`);
  }
}

exports.findOneAndPopulation = () => {
  return async (ctx, next) => {
    await next();
    
  }
}

exports.findField = (field_key) => {
  return async(ctx, next) => {
    console.log(`${field_key} findField Wait`);
    await next();
    console.log(`${field_key} findField Start`);
    let data = ctx.body.toJSON();
    console.log(data);
    ctx.body = data[field_key];
    console.log(`${field_key} findField End`);
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
    console.log(`${key} pushItem Wait`);
    await next();
    console.log(`${key} pushItem Start`);
    ctx.body = ctx.body[key][ctx.params.array_index];
    console.log(`${key} pushItem End`);
  }
}

exports.create = (collections) => {
  return async (ctx, next) => {
    await next();
    let model = new ctx.models[collections](ctx.request.body);
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
