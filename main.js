const fs = require('fs');
const request = require('request-promise-native');
const cheerio = require('cheerio');

const list = fs
  .readFileSync('./input.txt')
  .toString('utf-8')
  .split('\n')
  .filter(e => !!e);

const baseUrl = 'http://frps.eflora.cn';

let output = '';
let counter = 0;

async function process() {
  const results = await Promise.all(list.map(flora => {
    const primaryUrl = `${baseUrl}/frps?id=${encodeURIComponent(flora)}`;
    return request(primaryUrl).then(text => ({flora, text}));
  }));

  for(const entry of results) {
    const { flora, text } = entry;
    const $ = cheerio.load(text);
    const snameTag = $('#spinfoDiv')
      .children().first()
      .children().first().next()
      .children().first().next();

    let sname = '_';
    let afterBold = false;
    snameTag.contents().each(function(i, t) {
      if(this.type === 'text') {
        let filtered = this.data.replace(/^\s*$/g, '');
        while(filtered && filtered[0] == ' ') filtered = filtered.substr(1);
        while(filtered && filtered[filtered.length-1] == ' ') filtered = filtered.substr(0, filtered.length-1);
        if(!filtered) return;

        if(!afterBold) {
          afterBold = true;
          sname = sname.substr(0, sname.length-1);
          sname += '_ ';
        }
        sname += filtered + ' ';
      } else {
        sname += $(this).text() + ' ';
      }
    });

    while(sname && sname[sname.length-1] == ' ') sname = sname.substr(0, sname.length-1);

    let main = $('[style="margin:0 60px"]').eq(0);
    let idents = main.children('span + a');

    let ke = idents.eq(1).text().split(' ')[0];
    let shu = idents.eq(2).text().split(' ')[0];

    let altLine = $('[style="margin:0 60px"] a + p b:first-child').text();
    let altText = altLine;
    /*
    while(true) {
      const breakAfter = altText[0] === ' ' || '，' || '、' || '）';
      altText = altText.substr(1);
      if(breakAfter) break;
    }
    */
    // let altText = altLine.split('）').slice(1).join('）');
    let altSegs = altText.split('，');

    output += `${flora},${altSegs.join('、')},${sname},${ke},${shu}\n`;

    console.log(`Done: ${++counter}/${list.length}`);
  }

  fs.writeFileSync('./output.csv', output);
}

process();
