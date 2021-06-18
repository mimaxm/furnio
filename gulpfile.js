let projectFolder = "dist";
let sourceFolder = "#src";
let fs = require('fs');

let path = {
   build: {
      html: projectFolder + "/",
      css: projectFolder + "/css/",
      js: projectFolder + "/js",
      img: projectFolder + "/img/",
      fonts: projectFolder + "/fonts/",
   },
   src: {
      html: [sourceFolder + "/*.html", "!" + sourceFolder + "/_*.html"],
      css: sourceFolder + "/scss/style.scss",
      js: sourceFolder + "/js/script.js",
      img: sourceFolder + "/img/**/*.{jpg,png,svg,gif,ico,webp}",
      fonts: sourceFolder + "/fonts/*.ttf",
   },
   watch: {
      html: sourceFolder + "/**/*.html",
      css: sourceFolder + "/scss/**/*.scss",
      js: sourceFolder + "/js/**/*.js",
      img: sourceFolder + "/img/**/*.{jpg,png,svg,gif,ico,webp}",
   },
   clean: "./" + projectFolder + "/"
}

let {
   src,
   dest
} = require('gulp'),
   gulp = require('gulp'),
   browserSync = require('browser-sync').create(),
   fileInclude = require('gulp-file-include'),
   del = require('del'),
   scss = require('gulp-sass'),
   imagemin = require('gulp-imagemin'),
   ttf2woff = require('gulp-ttf2woff'),
   ttf2woff2 = require('gulp-ttf2woff2'),
   fonter = require('gulp-fonter')

function browserSyncInit(params) {
   browserSync.init({
      server: {
         baseDir: "./" + projectFolder + "/"
      },
      port: 3000,
      notify: false
   })
}

function html() {
   return src(path.src.html)
      .pipe(fileInclude())
      .pipe(dest(path.build.html))
      .pipe(browserSync.stream())
}

function css() {
   return src(path.src.css)
      .pipe(
         scss({
            outputStyle: "expanded"
         })
      )
      .pipe(dest(path.build.css))
      .pipe(browserSync.stream())
}

function js() {
   return src(path.src.js)
      .pipe(fileInclude())
      .pipe(dest(path.build.js))
      .pipe(browserSync.stream())
}

function images() {
   return src(path.src.img)
      .pipe(
         imagemin({
            progressive: true,
            svgoPlugins: [{
               removeViewBox: false
            }],
            interlaced: true,
            optimizationLevel: 3
         })
      )
      .pipe(dest(path.build.img))
      .pipe(browserSync.stream())
}

function fonts() {
   src(path.src.fonts)
      .pipe(ttf2woff())
      .pipe(dest(path.build.fonts))
   return src(path.src.fonts)
      .pipe(ttf2woff2())
      .pipe(dest(path.build.fonts))
}

gulp.task('otf2ttf', function () {
   return src([sourceFolder + '/fonts/*.otf'])
      .pipe(fonter({
         formats: ['ttf']
      }))
      .pipe(dest(sourceFolder + '/fonts/'))
})

function fontsStyle(params) {

   let file_content = fs.readFileSync(sourceFolder + '/scss/fonts.scss');
   if (file_content == '') {
      fs.writeFile(sourceFolder + '/scss/fonts.scss', '', cb);
      return fs.readdir(path.build.fonts, function (err, items) {
         if (items) {
            let c_fontname;
            for (var i = 0; i < items.length; i++) {
               let fontname = items[i].split('.');
               fontname = fontname[0];
               if (c_fontname != fontname) {
                  fs.appendFile(sourceFolder + '/scss/fonts.scss', '@include font("' + fontname + '", "' + fontname + '", "400", "normal");\r\n', cb);
               }
               c_fontname = fontname;
            }
         }
      })
   }
}

function cb() {}

function watchFiles(params) {
   gulp.watch([path.watch.html], html);
   gulp.watch([path.watch.css], css);
   gulp.watch([path.watch.js], js);
   gulp.watch([path.watch.img], images);
}

function clean(params) {
   return del(path.clean);
}

let build = gulp.series(clean, gulp.parallel(js, css, html, images, fonts), fontsStyle);
let watch = gulp.parallel(build, watchFiles, browserSyncInit);

exports.fontsStyle = fontsStyle;
exports.fonts = fonts;
exports.images = images;
exports.js = js;
exports.css = css;
exports.html = html;
exports.build = build;
exports.watch = watch;
exports.default = watch;