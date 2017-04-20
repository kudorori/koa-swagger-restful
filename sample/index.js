var Koa = require("koa");
var swaggerMogoose = require("koa-swagger-mongoose");
var restful = require("../src");
var body = require("koa-body");
var Router = require("koa-router");
var router = new Router();
const app = new Koa();
const host = "mongodb://root:root@ds145379.mlab.com:45379/restful_test"

app.use(body());

// response
app.use(async (ctx,next) => {
  ctx.collections = [];
  ctx.populates = [];
  ctx.findFields = [];
  try{
    console.log("事前處理定義：認證、判斷等等");
    await next();
    console.log("事後處理：資料轉換、輸出格式調整");
    ctx.body = {
      result: ctx.body
    }
  }catch(err){
    console.log(err);
    ctx.body = {
      err: err
    }
  }
});

/*
router.get("/user",async (ctx, next) => {
  //中間攔截，隨便丟個錯誤
//   throw "不給用";
});
*/

app.use(router.routes());
app.use(swaggerMogoose({
  path: `${__dirname}/api.yaml`,
	host: host,
	overwrite: {}
}));

app.use(restful({
    path: `${__dirname}/api.yaml`
}));

app.listen(3000);
