var rework = require('rework');
var reworkUrl = require('rework-plugin-url');
var through = require('through2');
var color = require('colors');
var path = require('path');

module.exports = function(options) {
	var root = options && options.imgPath ? options.imgPath : process.cwd();
	var urlLists = [];
	var imgPathArr = root.split('/');
	var imgCheckPath = '';

	imgPathArr.forEach((ele, index) => {
		if (index === 0) {
			imgCheckPath += ele + '\\/'
		} else if (index === imgPathArr.length - 1) {
			imgCheckPath += ele
		} else {
			imgCheckPath += ele + '\\/'
		}
	})


	if (/\.\//.test(root) || /\.\.\//.test(root)) {
		root = path.join(process.cwd(), root);
	}

	function convertUrls(css) {
		return rework(css)
			.use(reworkUrl(function(url) {

				const pattern = new RegExp('..\/' + imgCheckPath + '\\w+(.svg|.png)')

				if (pattern.test(url)) {
					if (!urlLists.includes(url)) {
						console.error(color.red('[ERROR!] ' + url));
					}

					urlLists.push(url);
				}
			}))
			.toString();
	}


	return through.obj(function(file, enc, cb) {
		if (file.contents) {
			var css = file.contents.toString(),
				filePath = file.path;

			if (/\.css$/.test(filePath)) {
				convertUrls(css);
			}

			file.contents = new Buffer(css);
			this.push(file);
		}
		cb();
	});
};
