const fs = require('fs');
const async = require('async');
const glob = require('glob');
const EmbedJS = require('embed-js');
const url = require('embed-plugin-url');
const emoji = require('embed-plugin-emoji');
const github = require('embed-plugin-github');

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

const layoutHtml = (files, cb) => {
  async.map(
    files,
    (file, cb) => formatFile(`
# ${file.filename}

${file.data}

`,
    cb),
    (err, parts) => cb(err, `
<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="stylesheet" href="https://unpkg.com/emoji.css/dist/emoji.min.css">
<style>
html {
  font-size: 15px;
  line-height: 1.12;
  font-family: monospace;
  max-width: 36rem;
  white-space: pre-wrap;
  background: #f00;
  color: #0ff;
  font-weight: bold;
}
a, a:link, a:visited, a:hover, a:active {
  color: #0ff;
}
.ec {
  font-size: 1.1rem;
  filter: hue-rotate(120deg); /* hue hue */
}
</style>
</head>
<body>
${parts.join('')}
</body>
</html>   
`
    )
  )
}

const formatFile = (data, cb) => {
  embed(data, cb)
 /* async.map(
    data.split('\n'),
    embed,
    (err, lines) => cb(err, lines.join('\n'))
  ) */
}

const embed = (str, cb) => {
  if (!str) { return cb(null, ''); }
  const embedder = new EmbedJS({
    input: str,
    plugins: [
      url(), emoji()
    ]
  });
  embedder.text()
    .then(({ result }) => cb(null, result))
    .catch(err => cb(err, null))
}

const writeIndex = (data, cb) => fs.writeFile(
  'index.html',
  data,
  cb
);

if (require.main === module) {
  main();
}
