global.$ = require("./js/global.js");

let sass = require('gulp-sass');
let autoprefixer = require('gulp-autoprefixer');
let csslint = require('gulp-csslint');
let csscomb = require('gulp-csscomb');
let cssformat = require('gulp-css-format');

let sequence = require('gulp-sequence');

let babel = require('gulp-babel');

let uglify = require('gulp-uglify');

let jshint = require('gulp-jshint');

let imagemin = require('gulp-imagemin');

let spritesmith = require('gulp.spritesmith');

let buffer = require('vinyl-buffer');

let merge = require('merge-stream');

let browserSync = require('browser-sync').create();

let reload = browserSync.reload;

let watch = require('gulp-watch');

let changed = require('gulp-changed');

let foal = require('gulp-foal')();

let plumber = require('gulp-plumber');

let clean = require('gulp-clean');

let fs = require('fs');

let path = require('path');

// ----------------------------------

let file = require('./js/file.js');

let icon = require('./js/icon.js');

let sprite = require('./js/sprite.js');

let cfg = $.cfg;

let gulp = $.gulp;

let pathArr = $.pathArr;



gulp.task('init', function() {
    cfg.src = gulp.env.src;
    cfg.dist = gulp.env.dist;

    setCfg(() => {
        Push();
    })

});


// gulp.task('default',()=>{
// 	setCfg(()=>{
// 		sequence(['scss'],'watch');
// 		console.log('over');
// 	});

// });

gulp.task('default', sequence(['scss'], 'watch'));

//读取json文件的配置
function setCfg(callback) {
	if(cfg.src){
		callback && callback();
	}else{

        file.read(path.join(__dirname, 'path.json'), (err, data) => {
            if (err) {
                console.log(err);
            } else {
                if (data) {
                    pathArr = JSON.parse(data);
                }
                cfg = pathArr[pathArr.length - 1];
                callback && callback();
            }

        });
    }
}

function Push() {
    pathArr.push(cfg);
    file.write(path.join(__dirname, 'path.json'), pathArr);
}

function dels(base,event){
    let path = event.history[0].split('\\');
    let name = path[path.length-1];
    let dir = path[path.length-2];

    // console.log(base+':'+dir+':'+name);
}


gulp.task('watch', () => {
    setCfg(() => {
        
        watch(`${cfg.src}/scss/**/*.scss`, (event)=>{
            // console.log(JSON.stringify(event));
            console.log("scss was changed!");
            dels('scss',event);
            gulp.start('scss');
            reload();
        });

         watch(`${cfg.src}/js/**/*.js`, ()=>{
            console.log("js was changed!");
            gulp.start('js');
            reload();
        });

        watch(`${cfg.src}/es6/**/*.js`, ()=>{
            console.log("es6 was changed!");
            gulp.start('es6');
            reload();
        });

        // gulp.watch(cfg.src + '/js/**/*.js', ['js']).on('change', (e) => {
        //     console.log("js was changed!");
        //     reload();
        // });


        watch(`${cfg.dist}/**/*.html`, ()=>{
            console.log("html was changed!");
            reload();
        });

        // gulp.watch(cfg.dist + '**/*.html').on('change', (e) => {
        //     console.log('html was changed');
        //     reload();
        // });

        watch(cfg.src+'/images/img/**/*', (events)=>{
            console.log('image was changed');
            gulp.start('image');
        });

        watch(cfg.src+'/images/sprite/**/*.png', (events)=>{
            console.log('sprite was changed');
            gulp.start('sprite');
            // foal.run(foal.sprite(events));
        });

         watch(cfg.src+'/icons/**/*.svg', (events)=>{
            console.log('iconfont was changed');
            // gulp.start('iconfont');
            foal.run(foal.iconfont(events));
        });
    });
});

//编译scss
gulp.task('scss', () => {
    setCfg(() => {
        console.log('scss start');
        let paths = file.findDir(`${cfg.src}/scss`);
        for(let i=0;i<paths.length;i++){
            let name = paths[i];
            let src,dist;
            if(name == './'){
                
                src = `${cfg.src}/scss/*.scss`;
                dist = `${cfg.dist}/css`;
            }else{
                
                src = `${cfg.src}/scss/${name}/*.scss`;
                dist = `${cfg.dist}/css/${name}`;
            }

            gulp.src(src)
                .pipe(changed(dist))
                .pipe(plumber())
                .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
                .pipe(autoprefixer()) //补全前缀
                .pipe(csslint()) //检查语法错误
                // .pipe(cssformat({ indent: 1, hasSpace: true })) //有bug, 会把@font-face删除
                // .pipe(csscomb())//格式化css(不管用)
                .pipe(gulp.dest(dist));
        }

    });
});

// 压缩js
gulp.task('js', () => {
    setCfg(() => {
        console.log('js start');
        let paths = file.findDir(`${cfg.src}/js`);
        for(let i=0;i<paths.length;i++){
            let name = paths[i];
            let src,dist;
            if(name == './'){
                
                src = `${cfg.src}/js/*.js`;
                dist = `${cfg.dist}/js`;
            }else{
                
                src = `${cfg.src}/js/${name}/*.js`;
                dist = `${cfg.dist}/js/${name}`;
            }

            gulp.src(src)
                .pipe(changed(dist))
                .pipe(plumber())
                .pipe(jshint()) //检查错误
                .pipe(jshint.reporter())
                .pipe(uglify()) //压缩js
                .pipe(gulp.dest(dist));
        }
    });
});

// 编译es6
gulp.task('es6', () => {
    setCfg(() => {
        console.log('es6 start');
        let paths = file.findDir(`${cfg.src}/js`);
        for(let i=0;i<paths.length;i++){
            let name = paths[i];
            let src,dist;
            if(name == './'){
                
                src = `${cfg.src}/es6/*.js`;
                dist = `${cfg.dist}/es6`;
            }else{
                
                src = `${cfg.src}/es6/${name}/*.js`;
                dist = `${cfg.dist}/es6/${name}`;
            }

            gulp.src(src)
                .pipe(changed(dist))
                .pipe(plumber())
                .pipe(babel({ presets: [__dirname + '/node_modules/babel-preset-es2015'] }))
                .pipe(gulp.dest(dist));
        }
    });
});

// 压缩图片
gulp.task('image', () => {
	setCfg(()=>{
        let paths = file.findDir(`${cfg.src}/js`);
        for(let i=0;i<paths.length;i++){
            let name = paths[i];
            let src,dist;
            if(name == './'){
                
                src = `${cfg.src}/images/img/*`;
                dist = `${cfg.dist}/images/img`;
            }else{
                
                src = `${cfg.src}/images/img/${name}/*`;
                dist = `${cfg.dist}/images/img/${name}`;
            }

            gulp.src(src)
                .pipe(changed(dist))
                .pipe(plumber())
                .pipe(imagemin([
                        imagemin.gifsicle({interlaced: true}),
                        imagemin.jpegtran({progressive: true}),
                        imagemin.optipng({optimizationLevel:5}),
                        imagemin.svgo({
                            plugins: [
                                {removeViewBox: true},
                                {cleanupIDs: false}
                            ]
                        })
                    ]))
                .pipe(gulp.dest(dist));
        }

		// return gulp.src(cfg.src+'/images/img/**/*')
  //                   .pipe(changed(cfg.dist+'/images/img'))
		// 			.pipe(imagemin([
		// 				imagemin.gifsicle({interlaced: true}),
		// 				imagemin.jpegtran({progressive: true}),
		// 				imagemin.optipng({optimizationLevel:5}),
		// 				imagemin.svgo({
		// 					plugins: [
		// 						{removeViewBox: true},
		// 						{cleanupIDs: false}
		// 					]
		// 				})
		// 			]))
		// 			.pipe(gulp.dest(cfg.dist+'/images/img'));
	})
});

//合并雪碧图
gulp.task('sprite',()=>{
    setCfg(()=>{
        let paths = file.findDir(`${cfg.src}/images/sprite`);
        console.log(paths);
        for(let i=0;i<paths.length;i++){
            let name = paths[i];
            for(let k in sprite){
                if(k != 'pngs'){
                    sprite[k](cfg,name);
                }
            }

            // let name = paths[i];
            // let src,dist;
            // let imgName = `${name}.png`;
            // let cssName = `font-${name}.scss`;
            // if(name == './'){
                
            //     src = `${cfg.src}/images/sprite/*.png`;
            //     dist = `${cfg.dist}/images/sprite`;
            //     cssDist = `${cfg.src}/scss`;
            // }else{
                
            //     src = `${cfg.src}/images/sprite/${name}/*.png`;
            //     dist = `${cfg.dist}/images/sprite/${name}`;
            //     cssDist = `${cfg.src}/scss/${name}`;

            // }

            // let spriteData = gulp.src(src)
            //             .pipe(changed(dist))
            //             .pipe(plumber())
            //             .pipe(spritesmith({
            //                 imgName: imgName,
            //                 cssName: cssName,
            //                 padding: 20,
            //                 algorithm: 'binary-tree',
            //                 cssTemplate: temp
            //             }));
            //             console.log(cfg.src);
            // // console.log(spriteData);

            // let imgStream = spriteData.img.pipe(buffer())
            //                               .pipe(imagemin())
            //                               .pipe(gulp.dest(dist));

            // let cssStream = spriteData.css.pipe(gulp.dest(cssDist));

            // merge(imgStream,cssStream);
        }
        // for(let i=0;i<paths.length;i++){
        //     let name = paths[i];
        //     let src = `${cfg.src}/images/sprite/${name}/*.png`;
        //     let imgName = `${name}.png`;
        //     let cssName = `font-${name}.scss`;
        //     let temp = `${__dirname}/temp/cssTemp.css.handlebars`;
        //     let spriteData = gulp.src(src)
        //                 .pipe(changed(cfg.dist+'/images/sprite'))
        //                 .pipe(spritesmith({
        //                     imgName: imgName,
        //                     cssName: cssName,
        //                     padding: 20,
        //                     algorithm: 'binary-tree',
        //                     cssTemplate: temp
        //                 }));
        //                 console.log(cfg.src);
        //     // console.log(spriteData);

        //     let imgStream = spriteData.img.pipe(buffer())
        //                                   .pipe(imagemin())
        //                                   .pipe(gulp.dest(`${cfg.dist}/images/sprite`));

        //     let cssStream = spriteData.css.pipe(gulp.dest(`${cfg.src}/scss`));

        //     merge(imgStream,cssStream);
        // }
    })
});


// 还是合并雪碧图，优化版本
foal.task('sprite', (event)=>{
    let path = event.history[0].split('\\');
    let name = path[path.length-2];
    let src = `${cfg.src}/images/sprite/${name}/*.png`;
    let imgName = `${name}.png`;
    let cssName = `font-${name}.scss`;
    let temp = `${__dirname}/temp/cssTemp.css.handlebars`;
    let spriteData = gulp.src(src)
                .pipe(changed(cfg.dist+'/images/sprite'))
                .pipe(spritesmith({
                    imgName: imgName,
                    cssName: cssName,
                    padding: 20,
                    algorithm: 'binary-tree',
                    cssTemplate: temp
                }));
                console.log(cfg.src);
    // console.log(spriteData);

    let imgStream = spriteData.img.pipe(buffer())
                                  .pipe(imagemin())
                                  .pipe(gulp.dest(`${cfg.dist}/images/sprite`));

    let cssStream = spriteData.css.pipe(gulp.dest(`${cfg.src}/scss/sprite`));

    merge(imgStream,cssStream);
});


foal.task('iconfont', (event)=>{
    let path = event.history[0].split('\\');
    let name = path[path.length-2];
    console.log('you should make svg larger , 1024 is best!');
    //foal.run(foal.cleanFont(name));

    setTimeout(()=>{
        for(let k in icon){
            if(k != 'icons'){
                icon[k](cfg,name);
            }
        }
        
    },1000)

});

foal.task('cleanFont', (name)=>{
    let dist;
    if(name=='./'){
        dist = `${cfg.dist}/fonts/*`;
    }else{
        dist=`${cfg.dist}/fonts/${name}/*`;
    }
    console.log(dist);
    return gulp.src(dist,{read: false})
                .pipe(clean({force:true}));
});



gulp.task('iconfont', ()=>{
    setCfg(()=>{
        let paths = file.findDir(`${cfg.src}/icons/`);
        for(let i=0;i<paths.length;i++){
            let name = paths[i];
            for(let k in icon){
                if(k != 'icons'){
                    icon[k](cfg,name);
                }
            }
        }
        
    });
});



//无刷新
gulp.task('serve', ['watch'], () => {
    setCfg(() => {

        browserSync.init({
            server: cfg.dist
        });

    });
});