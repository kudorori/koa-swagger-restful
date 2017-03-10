var Koa = require("koa");
var swaggerMogoose = require("koa-swagger-mongoose");
var restful = require("../");
var body = require("koa-body");
const app = new Koa();

const host = "mongodb://root:root@ds145379.mlab.com:45379/restful_test"

app.use(body());

/*
app.use(async (ctx,next) => {
  await next();
  let user = new (ctx.models.user)({
    username: "asdasd",
    nickname: "231231",
    gallery:[]
  });
  for(let i = 0 ; i <10 ;i ++){
    let image = new (ctx.models.imgs)({
      img_src: "ing3333"
    });
    let gallery = new (ctx.models.gallery)({
      img_src: "12313123"
    });
    await image.save();
    gallery.img = image;
    gallery.imgs.push(image);
    gallery.save();
    user.gallery.push(gallery);
  }
  
  await user.save();
});
*/

/*
app.use(async(ctx, next)=>{
  await next();
  let user = ctx.models.user;
  console.log(user.schema);
})
*/

// response
app.use(async (ctx,next) => {
  console.log("事前處理定義：認證、判斷等等");
  await next();
  console.log("事後處理：資料轉換、輸出格式調整");
  console.log(ctx.body);
  ctx.body = {
    result: ctx.body
  }
});

app.use(swaggerMogoose({
  path: `${__dirname}/api.yaml`,
	host: host,
	overwrite: {}
}));

app.use(restful(
  {
    path: `${__dirname}/api.yaml`
  }
));


app.listen(3000);
