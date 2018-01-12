
let fs = require('fs');

let path = require('path');


let file = {
	write:(path, arr)=>{
		fs.writeFile(path, JSON.stringify(arr,null,5),(err)=>{
			if(err) throw err;
			console.log('file create success!');
		});
	},

	read:(path,callback)=>{
		fs.readFile(path,'utf8', callback);
	},

	findDir: (paths)=>{
		let result = [];
		let files = fs.readdirSync(paths);
		files.forEach((item,i)=>{
			let fPath = path.join(paths, item);
			let stats = fs.statSync(fPath);
			if(stats.isDirectory()) result.push(item);
			
		});
		result.push('./');
	    return result;
	},

	createDir: (cfg,dirs)=>{
		if(!fs.existsSync(cfg.src)){
			fs.mkdirSync(cfg.src, (err)=>{
				if(err){
					console.error(err);
				}
			})
		}

		dirs.forEach((item, i)=>{

			let fPath = path.join(cfg.src, item);
			if(!fs.existsSync(fPath)) {
				fs.mkdir(fPath, (err)=>{
					if(err){
						console.error(err);
					}
					console.log(`${item}目录创建成功`);
				})
			}
		})
	}
};

module.exports = file;