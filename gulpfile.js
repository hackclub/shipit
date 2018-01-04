const gulp = require("gulp");
const autoPrefixer = require("gulp-autoprefixer");
const cleanCSS = require("gulp-clean-css");
const concat = require("gulp-concat");
const sass = require("gulp-sass");
const pump = require("pump");

// Change to another module with ES6 support
const composer = require("gulp-uglify/composer");
const uglify = composer(require("uglify-es"), console);

const SASS_PATHS = [
    "asset/sass/**/*.scss"
];

gulp.task("default", ["watch"]);

gulp.task("build", ["build-css"]);

gulp.task("build-css", cb => {
    pump([
        gulp.src(SASS_PATHS),
        sass(),
        autoPrefixer(),
        cleanCSS({
            compatibility: "ie8",
            rebase: false
        }),
        concat("shipit.min.css"),
        gulp.dest("asset/dist/")
    ], cb);
});

gulp.task("watch", ["watch-css"]);

gulp.task("watch-css", () => gulp.watch(SASS_PATHS, ["build-css"]));
