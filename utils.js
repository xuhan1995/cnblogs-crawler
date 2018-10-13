import superagent from 'superagent'
import cheerio from 'cheerio'
import async from 'async'

let authorInfos = []
let hash = {}

export function getPageUrls(pageNum) {
  let pageUrls = []
  for (let i = 0; i < pageNum ; i++) {
    let pageUrl = 'http://www.cnblogs.com/?CategoryId=808&CategoryType=%22SiteHome%22&ItemListActionName=%22PostList%22&PageIndex='+ i +'&ParentCategoryId=0'
    pageUrls.push(pageUrl)
  }
  return pageUrls
}

export function getBlogUrls(pageUrls, ep) {
  pageUrls.forEach(pageUrl => {
    superagent.get(pageUrl)
      .end((err, result) => {
        if (err) {
          console.error(err)
          return
        }
        const $ = cheerio.load(result.text)
        let blogUrls = $('.titlelnk')
        for (let i = 0; i < blogUrls.length; i++) {
          const blogUrl = blogUrls.eq(i).attr('href')
          ep.emit('GetBlog', blogUrl);
        }
      })
  })
}

function printBlogs(blogUrls, res) {
  blogUrls.forEach((bolgUrl, index) => {
    res.write(`第${index + 1}篇博客    ${bolgUrl}    <br/>`)
    console.log(`第${index + 1}篇博客    ${bolgUrl}`)
  })
}

function isRepeat(author) {
  if (hash[author] === undefined) {
    hash[author] = 1
    return false
  }
  return true
}

function getAuthorInfo(authorHome) {
  let authorInfo = {}
  superagent.get(authorHome)
    .end((err, result) => {
      if (err) {
        console.error(err)
      }
      const $ = cheerio.load(result.text)
      let info = $('#profile_block a')
      let age = ''
      authorInfo.nickName = info.eq(0).text()
      try {
        age = info.eq(1).attr('title').substr(-10)
      } catch (error) {
        age = '2012-01-01'
      }
      authorInfo.age = ((new Date() - new Date(age)) / 1000 / 3600 / 24)
      authorInfo.fans = info.length === 4 ? info.eq(2).text() : info.eq(3).text()
      authorInfo.focus = info.length === 4 ? info.eq(3).text() : info.eq(4).text()
      authorInfos.push(authorInfo)
    })
}

export function getBlogInfo(ep, res, pageUrls) {
  ep.after('GetBlog', pageUrls.length * 20, blogUrls => {    
    printBlogs(blogUrls, res)

    response = res
    
    async.mapLimit(blogUrls, 5, function (url, callback) {
      singleBlogHandler(url, callback)  
    }, function (err, result) {
      if (err) {
        console.error(err)
        return
      }
      res.end()
      console.log(authorInfos)
    })
  })
}

let count = 0
let response
const singleBlogHandler = (url, callback) => {
  count++
  let delay = parseInt((Math.random() * 1000) % 1000)
  console.log(`现在的并发数是: ${count} ,正在抓取的是: ${url} ,耗时: ${delay}毫秒`)
  superagent.get(url)
    .end((err, result) => {
      if (err) {
        console.error(err)
      }

      let author = url.split('/p/')[0].split('/')[3]
      let id = url.split('/p/')[1].split('.')[0]
      const $ = cheerio.load(result.text)
      response.write(`author: ${author}, ID: ${id}, title: ${$('title').text()} <br/>`)
      
      let repeat = isRepeat(author)

      if (!repeat) {
        let authorHome = "http://www.cnblogs.com/mvc/blog/news.aspx?blogApp="+ author;
        getAuthorInfo(authorHome);
      }
      
    })

  setTimeout(() => {
    count--
    callback(null, url + 'successful');
  }, delay)
}


