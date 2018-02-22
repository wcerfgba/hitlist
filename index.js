const fs = require('fs');
const async = require('async');
const glob = require('glob');
const MarkdownIt = require('markdown-it');

const main = () => {
  async.waterfall([
    loadFiles,
    headerizeFiles,
    renderFiles,
    sortFilesByName,
    concatFiles,
    layoutHtml,
    writeIndex
  ], console.log);
};

const loadFiles = (cb) => glob(
  '*.md',
  (err, filenames) => async.map(
    filenames,
    loadFile,
    cb
  )
);

const loadFile = (filename, cb) => fs.readFile(
  filename,
  'utf8',
  (err, data) => cb(null, {
    filename,
    data
  })
);

const headerizeFiles = (files, cb) => async.map(
  files,
  headerizeFile,
  cb
);

const headerizeFile = (file, cb) => cb(null, {
  ...file,
  data: `
# ${file.filename.slice(0, file.filename.length - 3)}

${file.data}


`
});

const renderFiles = (files, cb) => {
  const md = new MarkdownIt({
    linkify: true
  });
  
  async.map(
    files,
    (file, cb) => cb(null, {
      ...file,
      data: md.render(file.data)
    }),
    cb
  );
};

const sortFilesByName = (files, cb) => async.sortBy(
  files,
  (file, cb) => cb(null, file.filename),
  (err, result) => cb(err, result.reverse())
);

const concatFiles = (files, cb) => async.reduce(
  files,
  '',
  (memo, file, cb) => cb(null, memo + file.data),
  cb
);

const layoutHtml = (html, cb) => cb(null, `
<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body>
${html}
</body>
</html>
`);

const writeIndex = (data, cb) => fs.writeFile(
  'index.html',
  data,
  cb
);

if (require.main === module) {
  main();
}
