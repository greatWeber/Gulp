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

let del = require('del');

// ----------------------------------

let file = require('./js/file.js');

let icon = require('./js/icon.js');

let sprite = require('./js/sprite.js');

let cfg = $.cfg;

let gulp = $.gulp;

let NAME;

let pathArr = $.pathArr;



gulp.task('init', function() {
    cfg.src = gulp.env.src;
    cfg.dist = gulp.env.dist;
    cfg.name = gulp.env.name;

    setCfg(() => {
        Push();
    })

});


gulp.task('default', sequence( 'watch'));

// gulp.task('setCfg', function(){
//     console.log(gulp.env.name);
//     if(cfg.src){
//         callback && callback();
//     }else{

//         file.read(path.join(__dirname, 'path.json'), (err, data) => {
//             if (err) {
//                 console.log(err);
//             } else {
//                 if (data) {
//                     pathArr = JSON.parse(data);
//                 }
//                 if(NAME){
//                     pathArr.forEach((item, i)=>{
//                         if(item.name == NAME){
//                             cfg = item;
//                         }
//                     })
//                 }else{

//                 cfg = pathArr[pathArr.length - 1];
//                 }
//                 callback && callback();
//             }

//         });
//     }
// })

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
                    if(NAME){
                        pathArr.forEach((item, i)=>{
                            if(item.name == NAME){
                                cfg = item;
                            }
                        })
                    }else{

                        cfg = pathArr[pathArr.length - 1];
                    }
                }
                callback && callback();
            }

        });
    }
}

function Push() {
    let isno = true;
    for(let i=0;i<pathArr.length;i++){
        if(pathArr[i].name == cfg.name){
            pathArr[i] = cfg;
            isno = false;
            break;
        }
    }
    if(isno){
        pathArr.push(cfg);
    }
    file.write(path.join(__dirname, 'path.json'), pathArr);
}

// 同步删除文件
function dels(base,event){
    if(event.event == 'unlink'){
        let path = event.history[0].split('\\');
        let name = path[path.length-1];
        let dir = path[path.length-2];
        let fsName;
        if(base == 'css'){
            fsName = name.split('.')[0]+'.css';

        }else{
            fsName = name;
        }
        if(dir == 'scss'){
            dir = 'css'
        }
        if(dir == base){
            console.log(`${cfg.dist}/${base}/${fsName}`);
            del([`${cfg.dist}/${base}/${fsName}`],{force:true});
        }else{
            console.log(`${cfg.dist}/${base}/${dir}/${fsName}`);
            del([`${cfg.dist}/${base}/${dir}/${fsName}`],{force:true});
        }
        
    }
    console.log(event.event);
}

// 创建目录
gulp.task('build', ()=>{
    setCfg(()=>{
        file.createDir(cfg,['scss','js','es6','images','sprites','icons']);
    });
});


gulp.task('watch', () => {
    setCfg(() => {
        
        watch(`${cfg.src}/scss/**/*.scss`, (event)=>{
            // console.log(JSON.stringify(event));
            console.log("scss was changed!");
            dels('css',event);
            gulp.start('scss');
            reload();
        });

         watch(`${cfg.src}/js/**/*.js`, (event)=>{
            console.log("js was changed!");
            dels('js',event);
            gulp.start('js');
            reload();
        });

        watch(`${cfg.src}/es6/**/*.js`, (event)=>{
            console.log("es6 was changed!");
            dels('es6',event);
            gulp.start('es6');
            reload();
        });


        watch(`${cfg.dist}/**/*.html`, ()=>{
            console.log("html was changed!");
            reload();
        });



        watch(cfg.src+'/images/**/*', (event)=>{
            console.log('image was changed');
            dels('images',event);
            gulp.start('image');
        });

        watch(cfg.src+'/sprites/**/*.png', (event)=>{
            console.log('sprite was changed');
            // gulp.start('sprite');
            foal.run(foal.sprite(event));
        });

         watch(cfg.src+'/icons/**/*.svg', (event)=>{
            console.log('iconfont was changed');
            // gulp.start('iconfont');
            foal.run(foal.iconfont(event));
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
        let paths = file.findDir(`${cfg.src}/images`);
        for(let i=0;i<paths.length;i++){
            let name = paths[i];
            let src,dist;
            if(name == './'){
                
                src = `${cfg.src}/images/*`;
                dist = `${cfg.dist}/images`;
            }else{
                
                src = `${cfg.src}/images/${name}/*`;
                dist = `${cfg.dist}/images/${name}`;
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
	})
});

//合并雪碧图
gulp.task('sprite',()=>{
    setCfg(()=>{
        let paths = file.findDir(`${cfg.src}/sprites`);
        console.log(paths);
        for(let i=0;i<paths.length;i++){
            let name = paths[i];
            for(let k in sprite){
                if(k != 'pngs'){
                    sprite[k](cfg,name);
                }
            }

        }
    })
});


// 还是合并雪碧图，优化版本
foal.task('sprite', (event)=>{
    let paths = file.findDir(`${cfg.src}/sprites`);
    console.log(paths);
    for(let i=0;i<paths.length;i++){
        let name = paths[i];
        for(let k in sprite){
            if(k != 'pngs'){
                sprite[k](cfg,name);
            }
        }

    }
});


foal.task('iconfont', (event)=>{
    let path = event.history[0].split('\\');
    let name = path[path.length-2];
    console.log('you should make svg larger , 1024 is best!');
    //foal.run(foal.cleanFont(name));

    for(let k in icon){
        if(k != 'icons'){
            icon[k](cfg,name);
        }
    }
    // setTimeout(()=>{
        
    // },1000)

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