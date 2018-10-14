const fs = require('fs');
const input = fs.readFileSync('output.csv').toString('utf-8');
const lines = input.split('\n');

let result = '';

for(const line of lines) {
  if(!line) continue;
  const segs = line.split(',');
  const regex = new RegExp(`^[^、]*${segs[0]}(（[^）]*）)*\s*`);
  if(!segs[1].match(regex)) {
    console.log('unmatched');
    segs[1] = 'UNMATCHED';
  } else {
    segs[1] = segs[1].replace(regex, '');
    // console.log(segs[1]);
    let removing = / *图版.*$/;
    if(segs[1].match(removing)) {
      let result = segs[1].match(removing);
      console.log(result);
      segs[1] = segs[1].substr(0, result.index);
      console.log(segs[1]);
    }
  }

  result += segs.join(',') + '\n';
}

fs.writeFileSync('filtered.csv', result);
