const FS = require('fs'),
  Path = require('path'),
  { statAsync, mkdirAsync, accessAsync } = require('./utils'),
  { to } = require('await-to-js');
request = require('request');

class Ut {
  /**
   * 下载网络图片
   * @param {object} opts
   */
  static downImg(opts = {}, path, output = './images') {
    return new Promise(async (resolve, reject) => {
      // 检查输出目录是否存在
      const [statOutputErr] = await to(statAsync(output));
      statOutputErr && (await to(mkdirAsync(output)));

      if (!path) {
        path =
          output +
          '/' +
          new URL(opts.url).pathname.slice(1).replace(/\//g, '-');

        if (!Path.extname(path)) {
          // path += '.' + res.headers['content-type'].split('/')[1];
          path += '.jpg';
        }
      }

      // 检查文件是否存在
      const [accessPathErr] = await to(accessAsync(path));
      if (!accessPathErr) {
        console.log('文件已存在：' + path);
        resolve(path);
        return;
      }
      request
        .get(opts)
        .on('response', async res => {
          // console.log(res.headers['content-type']);
          /* res
              .pipe(FS.createWriteStream(path))
              .on('error', e => {
                console.log('pipe error', e);
                reject([e, path]);
              })
              .on('finish', () => {
                resolve(path);
              })
              .on('close', () => {}); */
        })
        .pipe(FS.createWriteStream(path))
        .on('error', e => {
          console.log('pipe error', e);
          reject([e, path]);
        })
        .on('finish', () => {
          resolve(path);
        })
        .on('close', () => {});
    });
  }
}

module.exports = Ut;