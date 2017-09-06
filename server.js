/**
 * @desc a simple parser to parse request body
 * @author hydra(jianzhou520)
 */
const http = require('http')
const fs = require('fs')
const queryString = require('querystring')

/**
 *
 * @desc used to parse request body when its content-type is multipart/form-data
 * @param {Buffer Array} reqBody means the body of the request
 */
function parseFormData (reqBody) {
  let boundary = reqBody.toString().substr(0, reqBody.toString().indexOf('\r\n'))
  let hasMoreParams = true
  let fileds = []
  let REG_FILENAME = /filename=".*"/
  let REG_FILEDNAME = /^name=".*"/
  while (hasMoreParams) {

    // delete the first line(contains boundary & \r\n)
    reqBody = reqBody.slice(Buffer.byteLength(boundary) + 2)
    let reqBodyStr = reqBody.toString()
    let contentDisposition = reqBodyStr.substr(0, reqBodyStr.indexOf('\r\n'))
    reqBody = reqBody.slice(Buffer.byteLength(contentDisposition) + 2)
    reqBodyStr = reqBody.toString()

    // to judge whether there is filename in Content-Dispotion, when it contains this key word.
    // it means this filed contains file data
    // filed = {name: '', value: '', type: ''}
    let filed = {}
    let filedIsFile = false // or 'file'
    contentDisposition.split(';').forEach(item => {
      item = item.trim()

      // parse filed name & value
      if (REG_FILEDNAME.test(item)) {
        filed.name = item.split('=')[1]
      } else if (REG_FILENAME.test(item)) {
        filedIsFile = true
      }
    })

    // remove the line of content-disposition
    // if this param's type is file, the filed will contain a description line includes 'content-type'
    if (filedIsFile) {
      let contentType = reqBodyStr.substr(0, reqBodyStr.indexOf('\r\n'))
      reqBody = reqBody.slice(Buffer.byteLength(contentType) + 2)
      filed.type = contentType.split(':')[1].trim()
    }

    // minus 2 to remove the \r\n
    filed.value =  reqBody.slice(2, reqBody.indexOf(Buffer.from(`${boundary}`)) - 2)
    reqBody = reqBody.slice(reqBody.indexOf(Buffer.from(`${boundary}`)))
    fileds.push(filed)
    if (reqBody.toString().indexOf(boundary) === reqBody.toString().indexOf(`${boundary}--`)) {
      hasMoreParams = false
    }
  }
  return fileds
}

const server = http.createServer((req, res) => {
  try {
    let result = null
    req.on('data', chunk => {
      if (!result) {
        result = chunk
      } else {
        result = Buffer.concat(result, chunk)
      }
    })
    req.on('end', () => {
      let stringData = result.toString()
      let boundary = stringData.substr(0, stringData.indexOf('\r\n'))
      let fileds = parseFormData(result)
      res.setHeader('Access-Control-Allow-Origin', '*')
      res.setHeader('content-type', 'application/json')
      res.setHeader('content-length', JSON.stringify({status: 200}).length)
      res.end(JSON.stringify({status: 200}))
      fileds.forEach(item => {

        // you can extend more file type by MIME type
        switch (item.type && item.type.split('/')[1]) {
          case 'png':
            fs.writeFileSync(`./files/${Date.now() + Math.ceil(Math.random() * 40)}.png`, item.value, err => {
              if (err) {
                console.trace(err)
              }
            })
            break;
          default:
            break;
        }
      })
      fs.writeFile('./test.png', result, err => {
        if (err) {
          console.trace(err)
        }
      })
      res.end({data: true, status: 1})
    })
  } catch (error) {
    console.trace(error)
  }
})

server.listen(8080, () => {
  console.log('server listen on port 8080')
})