const { load, cut } = require("@node-rs/jieba");
const fs = require("fs");
let axios = require("axios");
let 词频 = {};
let 词频数组 = [];
let 尾词频 = {};
let 尾词频数组 = [];
let 无理关键字 = /:|\)|）|　|？|\./g;
async function 单曲词频分析(id) {
  let lyric = (
    await axios.get("https://api.imjad.cn/cloudmusic/?type=lyric&id=" + id)
  ).data.lrc.lyric;
  lyric = lyric
    .replace(/\[.+\]/g, "")
    .replace(/\n/g, " ")
    .split(" ")
    .map((v) => {
      if (v) {
        let 分词 = cut(v);
        let lastItem = 分词[分词.length - 1];
        if (lastItem.match(无理关键字)) {
          lastItem = 分词[分词.length - 2];
        }
        if (lastItem) {
          if (尾词频[lastItem]) {
            尾词频[lastItem] += 1;
          } else {
            尾词频[lastItem] = 1;
          }
        }
        for (let i = 0; i < 分词.length; i++) {
          let item = 分词[i];
          if (item.match(无理关键字)) {
            continue;
          }
          if (词频[item]) {
            词频[item] += 1;
          } else {
            词频[item] = 1;
          }
        }
      }
      return v;
    });
  console.log(id + "分析完成");
}

async function 歌单词频分析(id) {
  let list = (
    await axios.get("https://api.imjad.cn/cloudmusic/?type=playlist&id=" + id)
  ).data.playlist.trackIds;

  for (let i = 0; i < list.length; i++) {
    await 单曲词频分析(list[i].id);
  }
  for (const key in 词频) {
    词频数组.push({ word: key, count: 词频[key] });
  }
  for (const key in 尾词频) {
    尾词频数组.push({ word: key, count: 尾词频[key] });
  }
  生成文件(id);
}

function 生成文件(id) {
  词频数组 = 词频数组.sort((a, b) => {
    return b.count - a.count;
  });
  尾词频数组 = 尾词频数组.sort((a, b) => {
    return b.count - a.count;
  });
  fs.writeFileSync(id + "词频.json", JSON.stringify(词频), "utf8");
  fs.writeFileSync(id + "尾词频.json", JSON.stringify(尾词频), "utf8");
  fs.writeFileSync(id + "词频数组.json", JSON.stringify(词频数组), "utf8");
  fs.writeFileSync(id + "尾词频数组.json", JSON.stringify(尾词频数组), "utf8");
}

歌单词频分析(632021463);
