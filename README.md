# node-formdata-parser
It's a simple parser for requests whose content type is 'form-data' know as file upload. The parser has ability to parse the normal params and create file

# install
```bash
  git clone git@github.com:jianzhou520/node-formdata-parser.git
```

# start
```bash
  node server
```

# upload file to use
open the index.html file just in chrome or other morden browser, select a file(now only support png file, you can extend in server.js file) to upload. You will see the server get all the request fileds and write a copy file to the files directory

# key point
Buffer operation & split the request body

# one more thing
This is a very simple example to show my way in parsing formData in node
