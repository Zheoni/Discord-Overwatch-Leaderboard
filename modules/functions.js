const fs = require('fs');

module.exports.help = {
  name: 'functions',
  command: false
}

module.exports.saveData = function (data, file) {
  let rawdata = JSON.stringify(data, null, 2);
  fs.writeFileSync(file, rawdata + '\n', (err) => {
    if(err) console.log(err)
  });
}

module.exports.loadData = function (file) {
  return JSON.parse(fs.readFileSync(file));
}