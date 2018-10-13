import eventproxy from 'eventproxy'
import { getPageUrls, getBlogUrls, getBlogInfo } from '../utils'
 
const handler = (req, res) => {
  const pageNum = 200
  // 获取200个页面的url
  let pageUrls = getPageUrls(pageNum)
  const ep = new eventproxy()
  // 异步获取4000个博客的url
  getBlogUrls(pageUrls, ep)
  // 获取完4000个博客后的操作
  getBlogInfo(ep, res, pageUrls)
}

export default handler