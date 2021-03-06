let gulp = require('gulp');

let buffer = require('vinyl-buffer');

let merge = require('merge-stream');

let imagemin = require('gulp-imagemin');

let spritesmith = require('gulp.spritesmith');

let changed = require('gulp-changed');

let plumber = require('gulp-plumber');

let template = require('gulp-template');

let path = require('path');

let fs = require('fs');


let dir = path.resolve(__dirname,'..');

let sprite = {
	sprites: (cfg, name)=>{
		let src,dist,cssDist,cssImg, className,imgName,cssName;
        let temp = `${dir}/temp/cssTemp.css.handlebars`;
        if(name == './'){
        	imgName = 'default.png';
            cssName = 'sprite-default.scss';
            className = 'sprite-default';
            src = `${cfg.src}/sprites/*.png`;
            dist = `${cfg.dist}/sprites`;
            cssDist = `${cfg.src}/scss`;
            cssImg = `default.png`;
        }else{
        	imgName = `${name}.png`;
            cssName = `sprite-${name}.scss`;
            className = `sprite-${name}`;
            src = `${cfg.src}/sprites/${name}/*.png`;
            dist = `${cfg.dist}/sprites/${name}`;
            cssDist = `${cfg.src}/scss/${name}`;
            cssImg = `${name}/${name}.png`;
        }
        let spriteData = gulp.src(src)
                        .pipe(changed(dist))
                        .pipe(plumber())
                        .pipe(spritesmith({
                            imgName: imgName,
                            cssName: cssName,
                            padding: 20,
                            algorithm: 'binary-tree',
                            cssTemplate: temp,
                            cssVarMap: (sprite)=>{
                            	sprite.css_image = cssImg,
                            	sprite.class_name = className
                            }
                        }));
                        console.log(cfg.src);
        // console.log(spriteData);

        let imgStream = spriteData.img.pipe(buffer())
                                      .pipe(imagemin())
                                      .pipe(gulp.dest(dist));

        let cssStream = spriteData.css.pipe(gulp.dest(cssDist));

        merge(imgStream,cssStream);
	},

	example: (cfg, name)=>{
		let dist, cssDist, className;
        if(name == './'){
        	className = 'sprite-default';
            dist = `${cfg.dist}/sprites`;
            cssDist = '../css/sprite-default.css';
        }else{
        	className = `sprite-${name}`;
            dist = `${cfg.dist}/sprites/${name}`;
            cssDist = `../../css/${name}/sprite-${name}.css`;

        }
        console.log('example');
		return gulp.src(`${dir}/temp/sprite.html`)
					// .pipe(changed(dist))            
                    .pipe(plumber())
					.pipe(template({
						pngs: sprite.pngs(cfg, name),
						css: cssDist,
						name: className

					}))
					.pipe(gulp.dest(dist));
	},

	pngs: (cfg, name)=>{
		let src;
        if(name == './'){
            src = `${cfg.src}/sprites/`;
        }else{
            
            src = `${cfg.src}/sprites/${name}/`;
        }
        let png = fs.readdirSync(src);
		png = png.map((p)=>{
			return p.replace(/\.\w+$/,'');
		});
		return png;
	}
}

module.exports = sprite;