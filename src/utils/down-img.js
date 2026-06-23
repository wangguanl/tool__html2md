const FS = require('fs'),
  Path = require('path'),
  { statAsync, mkdirAsync, accessAsync } = require('wgl-node-utils'),
  { to } = require('await-to-js'),
  request = require('superagent');

/**
 * 下载网络图片
 * @param {object} opts
 */
const downImg = (opts = {}, { output = './images', prefix, filename }) =>
  new Promise(async (resolve, reject) => {
    // 检查输出目录是否存在
    const [statOutputErr] = await to(statAsync(output));
    statOutputErr && (await to(mkdirAsync(output)));

    let name =
      filename ||
      (prefix ? prefix + '-' : '') +
        new URL(opts.url).pathname.slice(1).replace(/\//g, '-');

    if (!Path.extname(name)) {
      name += '.png';
    }
    const path = Path.resolve(output, name);
    // 检查文件是否存在
    const [accessPathErr] = await to(accessAsync(path));
    if (!accessPathErr) {
      console.log('文件已存在：' + path);
      resolve(path);
      return;
    }
    request
      .get(opts.url)
      .on('response', async res => {
        // console.log(res.headers['content-type']);
        // path += '.' + res.headers['content-type'].split('/')[1];
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

/* downImg(
  {
    url: `https://mmbiz.qpic.cn/mmbiz_png/JdfjlwvwuTCFNIPLsWue7ZV6NxShjVOez9N4mG9J9KF6nuO7Hf1T7ewSyiaMysib021nP6G5no6J295nELQ0JMRg/640?wx_fmt=png`,
  },
  {}
);
 */
module.exports = downImg;
