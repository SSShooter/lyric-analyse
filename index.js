const { load, cut } = require('@node-rs/jieba')
const fs = require('fs')
let axios = require('axios')
let 词频 = {}
let 词频数组 = []
let 韵脚 = {}
let 韵脚数组 = []
let 无理关键字 = /:|\)|）|　|？|\./g
async function 单曲词频分析(id) {
  let exist = await 检测文件是否存在(id)
  let lyric = ''
  if (exist) {
    lyric = fs.readFileSync('./cache/' + id, 'utf8')
  } else {
    lyric = (
      await axios.get('https://api.imjad.cn/cloudmusic/?type=lyric&id=' + id)
    ).data.lrc.lyric
    fs.writeFileSync('./cache/' + id, lyric, 'utf8')
  }
  lyric
    .replace(/\[.+\]/g, '')
    .split('\n')
    .map((v, line) => {
      // TODO 空格断为两句
      if (v) {
        let 分词 = cut(v)
        let lastItem = 分词[分词.length - 1]
        if (lastItem.match(无理关键字)) {
          lastItem = 分词[分词.length - 2]
        }
        if (lastItem) {
          if (韵脚[lastItem]) {
            韵脚[lastItem].push({ id, line })
          } else {
            韵脚[lastItem] = [{ id, line }]
          }
        }
        for (let i = 0; i < 分词.length; i++) {
          let item = 分词[i]
          if (item.match(无理关键字)) {
            continue
          }
          if (词频[item]) {
            词频[item] += 1
          } else {
            词频[item] = 1
          }
        }
      }
      return v
    })
  console.log(id + '分析完成')
}

async function 歌单词频分析(id) {
  let list = (
    await axios.get('https://api.imjad.cn/cloudmusic/?type=playlist&id=' + id)
  ).data.playlist.trackIds

  for (let i = 0; i < list.length; i++) {
    await 单曲词频分析(list[i].id)
  }
  for (const key in 词频) {
    词频数组.push({ word: key, count: 词频[key] })
  }
  for (const key in 韵脚) {
    韵脚数组.push({ word: key, count: 韵脚[key].length, source: 韵脚[key] })
  }
  生成文件(id)
}

function 生成文件(id) {
  词频数组 = 词频数组.sort((a, b) => {
    return b.count - a.count
  })
  韵脚数组 = 韵脚数组.sort((a, b) => {
    return b.count - a.count
  })
  fs.writeFileSync(id + '词频.json', JSON.stringify(词频), 'utf8')
  fs.writeFileSync(id + '韵脚.json', JSON.stringify(韵脚), 'utf8')
  fs.writeFileSync(id + '词频数组.json', JSON.stringify(词频数组), 'utf8')
  fs.writeFileSync(id + '韵脚数组.json', JSON.stringify(韵脚数组), 'utf8')
}

function 检测文件是否存在(id) {
  return new Promise((resolve, reject) => {
    fs.access('./cache/' + id, fs.constants.F_OK, (err) => {
      if (err) {
        resolve(0)
      } else {
        resolve(1)
      }
    })
  })
}

歌单词频分析(2299383318)

// 检测文件是否存在(1).then(res=>console.log(res))
