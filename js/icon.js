let gulp = require('gulp');

let iconfont = require('gulp-iconfont');

let iconfontCss = require('gulp-iconfont-css');

let clean = require('gulp-clean');

let template = require('gulp-template');

let plumber = require('gulp-plumber');

let fs = require('fs');

let path = require('path');

let dir = path.resolve(__dirname,'..');


let icon = {
	
	iconfont: (cfg, name)=>{
		let src,dist,cssDist,fontName, cssClass,targetPath;
        if(name == './'){
        	fontName = 'font-default';
            targetPath = `${cfg.src}/scss/font-default.scss`;
            src = `${cfg.src}/icons/*.svg`
            dist = `${cfg.dist}/fonts`;
            fontPath = `../fonts/`;
            cssClass = 'icon';
        }else{
        	fontName = `font-${name}`;
            targetPath = `${cfg.src}/scss/${name}/font-${name}.scss`;
            src = `${cfg.src}/icons/${name}/*.svg`;
            dist = `${cfg.dist}/fonts/${name}`;
            fontPath = `../../fonts/${name}/`;
            cssClass = `icon-${name}`;
        }
		return gulp.src(src)
					.pipe(iconfontCss({
						fontName: fontName,
						path: `${dir}/temp/iconfont.scss`,
						targetPath: targetPath,
						fontPath: fontPath,
						cssClass: cssClass
					}))
					.pipe(iconfont({
						fontName: fontName,
						prependUnicode: true,
						formats: ['svg','ttf','eot','woff'],
						normalize: true,
						fixedWidth: false,
						// fontHeight: 1001
					}))
					.on('glyphs', (glyphs, options)=>{

					})
					.pipe(gulp.dest(`${cfg.dist}/fonts/${name}`))

	},

	example: (cfg, name)=>{
		let cssPath,cssClass;
		if(name == './'){
			cssPath = '../css/font-default.css';
			dist = `${cfg.dist}/fonts`;
			cssClass = 'icon';
		}else{
			cssPath = `../../css/${name}/font-${name}.css`;
			dist = `${cfg.dist}/fonts/${name}`;
			cssClass = `icon-${name}`;
		}
		// let that = this;
		return gulp.src(`${dir}/temp/icon.html`)
					.pipe(plumber())
					.pipe(template({
						icons: icon.icons(cfg, name),
						cssPath: cssPath,
						cssClass: cssClass
					}))
					.pipe(gulp.dest(dist));
	},

	icons: (cfg, name)=>{
		let icons = fs.readdirSync(`${cfg.src}/icons/${name}`);
		icons = icons.map((icon)=>{
			return icon.replace(/\.\w+$/,'');
		});
		return icons;
	}
}

module.exports = icon;