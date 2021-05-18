
let project_folder = require('path').basename(__dirname);  // "dist"; //создает вместо папки дист папку с именем проекта
let source_folder = "#src";

let fs = require('fs');

let path = {
    build: {
        html: project_folder + "/",
        css: project_folder + "/css/",
        js: project_folder + "/js/",
        img: project_folder + "/img/",
        fonts: project_folder + "/fonts/",
    },
    src: {
        html: [source_folder + "/*.html", "!" + source_folder + "/_*.html"], //знак "!" для исключения файлов с "_" чтоб не копировать куски index.html в dist
        css: source_folder + "/scss/style.scss",
        js: source_folder + "/js/script.js",
        img: source_folder + "/img/**/*.{jpg,png,svg,gif,ico,webp}",
        fonts: source_folder + "/fonts/*.ttf",
    },
    watch: {
        html: source_folder + "/**/*.html",
        css: source_folder + "/scss/**/*.scss",
        js: source_folder + "/js/**/*.js",
        img: source_folder + "/img/**/*.{jpg,png,svg,gif,ico,webp}",
    },
    clean: "./" + project_folder + "/"
}

let { src, dest } = require('gulp'),
    gulp = require('gulp'),
    browsersync = require('browser-sync').create(),
    fileinclude = require("gulp-file-include"),
    del = require("del"), // для удаления файлов
    scss = require("gulp-sass"), // для обработки scss
    autoprefixer = require("gulp-autoprefixer"), //добавляет префиксы вендеров в css
    group_media = require("gulp-group-css-media-queries"), //собирает медиазапросы, групирует их и ставит их в конец файла
    clean_css = require("gulp-clean-css"), // чистит и сжимает css
    rename = require("gulp-rename"), //для создания несжатого файла css
    uglify = require("gulp-uglify-es").default, //для сжатия js
    imagemin = require("gulp-imagemin"), //оптимизация изображений
    webp = require('gulp-webp'), //для картинок в вебпи... НУЖНО УСТАНОВИТЬ npm install webp-converter@2.2.3 --save-dev
    webphtml = require('gulp-webp-html'), // чтоб упростить объявление картинок в html
    webpcss = require('gulp-webpcss'),  //для поддержки вебпи в сисс, только нужно еще установить плагин " npm i --save-dev gulp-webp-css " иначе выдает ошибку
    svgSprite = require('gulp-svg-sprite'), // перед установкой плагина нужно в окне администратора PowerShell запустить: " Set-ExecutionPolicy RemoteSigned "
    ttf2woff = require('gulp-ttf2woff'), // перед установкой плагинов нужно в окне администратора PowerShell запустить для 
    ttf2woff2 = require('gulp-ttf2woff2'), //установки питона: npm install --global --production windows-build-tools
    fonter = require('gulp-fonter'); //для перегонки otf в woff

function browserSync(params) {
    browsersync.init({
        server: {
            baseDir: "./" + project_folder + "/"
        },
        port: 3000,
        notify: false
    })
}

function html() {
    return src(path.src.html)
        .pipe(fileinclude())            //объединяет файлы 
        .pipe(webphtml())   //этот плагин дописывает код в html чтоб в адекватных браузерах загружалось вебпи а в старых обычный jpg
        .pipe(dest(path.build.html))
        .pipe(browsersync.stream())
}

function css() {
    return src(path.src.css)
        .pipe(          //обработка scss
            scss({
                outputStyle: "expanded" //чтоб css создавался развернутым, не сжимался
            })
        )
        .pipe(
            group_media()
        )
        .pipe(
            autoprefixer({
                overrideBrowserslist: ["last 5 versions"],  // браузеры которые нужно поддерживать
                cascade: true //стиль написания автопрефиксора
            })
        )
        .pipe(webpcss()) //добавляет поддержку вебпи в сисс
        .pipe(dest(path.build.css)) //перед тем как сжать и переменовать css, выгружаем его
        .pipe(clean_css())
        .pipe(      //переименовуем сжатый файл css
            rename({
                extname: ".min.css"
            })
        )
        .pipe(dest(path.build.css))
        .pipe(browsersync.stream())
}

function js() {
    return src(path.src.js)
        .pipe(fileinclude())            //объединяет файлы 
        .pipe(dest(path.build.js)) //выгрузка в dist
        .pipe(
            uglify()
        )
        .pipe(      //переименовуем сжатый файл js
            rename({
                extname: ".min.js"
            })
        )
        .pipe(dest(path.build.js)) //выгрузка в dist
        .pipe(browsersync.stream()) // обновляет браузер
}

function images() {
    return src(path.src.img)
        .pipe(
            webp({      //создает вебпи
                quality: 70
            })
        )
        .pipe(dest(path.build.img)) //выгрузка в dist вебпи
        .pipe(src(path.src.img))
        .pipe(
            imagemin({  //оптимизация изображений с настройками. если не работает можно попробовать npm install mozjpeg
                progressive: true,
                svgoPlugins: [{ removeViewBox: false }],
                interlaced: true,
                optimizationLevel: 3 // 0 to 7
            })
        )
        .pipe(dest(path.build.img)) //выгрузка в dist
        .pipe(browsersync.stream()) // обновляет браузер
}

function fonts() {
    src(path.src.fonts)
        .pipe(ttf2woff())
        .pipe(dest(path.build.fonts)); //выгрузка в шрифтов в дист
    return src(path.src.fonts)
        .pipe(ttf2woff2())
        .pipe(dest(path.build.fonts)); //выгрузка в шрифтов в дист
};

gulp.task('otf2ttf', function () {  // задача, для выполнения gulp otf2ttf 
    return src([source_folder + '/fonts/*.otf']) //обращаемся к otf, конвертируем в ttf и выгружаем их в исходники
        .pipe(fonter({
            formats: ['ttf'] //конвертируем в ttf
        }))
        .pipe(dest(source_folder + '/fonts/')); //и выгружаем их в исходники
})

gulp.task('svgSprite', function () { // таск для обработки svg, для запуска  gulp svgSprite. Нужен не часто. Таски нужны для запуска задач, которые не нужно выполнять каждый раз...
    return gulp.src([source_folder + '/iconsprite/*.svg'])
        .pipe(svgSprite({
            mode: {
                stack: {
                    sprite: "../icons/icons.svg", //sprite file nsme
                    example: true // создает папку с примером..., из примера можно брать html код для своей верстки
                }
            },
        }
        ))
        .pipe(dest(path.build.img))
})

function fontsStyle(params) {
    let file_content = fs.readFileSync(source_folder + '/scss/fonts.scss');
    if (file_content == '') {
        fs.writeFile(source_folder + '/scss/fonts.scss', '', cb);
        return fs.readdir(path.build.fonts, function (err, items) {
            if (items) {
                let c_fontname;
                for (var i = 0; i < items.length; i++) {
                    let fontname = items[i].split('.');
                    fontname = fontname[0];
                    if (c_fontname != fontname) {
                        fs.appendFile(source_folder + '/scss/fonts.scss', '@include font("' + fontname + '", "' + fontname + '", "400", "normal");\r\n', cb);
                    }
                    c_fontname = fontname;
                }
            }
        })
    }
}

function cb() {

}

function watchFiles(params) {       //функц отслеживает изменение файлов
    gulp.watch([path.watch.html], html);
    gulp.watch([path.watch.css], css);
    gulp.watch([path.watch.js], js);
    gulp.watch([path.watch.img], images);
}

function clean(params) {  //футкция которая удаляет папку
    return del(path.clean); //возвращает плагин del
}

let build = gulp.series(clean, gulp.parallel(js, css, html, images, fonts), fontsStyle); //clean удаляет папку dist  перед ее созданием. parallel - для одновременной обработки
let watch = gulp.parallel(build, watchFiles, browserSync); //сценарий выполнения

exports.fontsStyle = fontsStyle;
exports.images = images;
exports.js = js;
exports.css = css;
exports.html = html;
exports.build = build;
exports.watch = watch;
exports.default = watch;

