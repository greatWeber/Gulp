
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
	}
};

module.exports = file;