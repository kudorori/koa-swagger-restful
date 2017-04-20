var gulp = require('gulp');
var server = require("gulp-develop-server");


gulp.task("default", () => {
  server.listen({
    env : {
        TZ:"Asia/Taipei",
        PORT:3001
    },
    path : './sample/index.js',
  });
  gulp.watch("./src/**.js", () => {
    server.restart();
  })
})
