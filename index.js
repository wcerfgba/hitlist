const fs = require('fs');
const async = require('async');
const glob = require('glob');

const main = () => {
  async.waterfall([
    loadFiles,
    sortFilesByName,
    layoutHtml,
    writeIndex
  ], console.log);
};

const loadFiles = (cb) => glob(
  '*.jf',
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

const sortFilesByName = (files, cb) => async.sortBy(
  files,
  (file, cb) => cb(null, file.filename),
  (err, result) => cb(err, result.reverse())
);

const layoutHtml = (files, cb) => cb(null, `
<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
body {
  font-family: monospace;
  max-width: 32rem;
}
</style>
</head>
<body>
${each(files, file => formatFile(`
# ${file.filename}

${file.data}

`))}
</body>
</html>
`);

const each = (xs, f) => xs.map(f).join('');

const formatFile = (data) => (
  data
    .split('\n')
    .map(line => linkify(line))
    .join('<br/>\n')
);

const linkify = (str) => (
  str.replace(/https?:\/\/\S+/g, '<a href="$&">$&</a>')
);

const writeIndex = (data, cb) => fs.writeFile(
  'index.html',
  data,
  cb
);

if (require.main === module) {
  main();
}
