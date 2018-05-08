/**
 * Thanks to huntbao@GitHub
 */
const dictionary = {
  '阿': 'a', '哎': 'ai', '安': 'an', '肮': 'ang', '凹': 'ao',
  '丷': 'ba', '挀': 'bai', '扳': 'ban', '邦': 'bang', '勹': 'bao',
  '陂': 'bei', '奔': 'ben', '伻': 'beng', '屄': 'bi', '边': 'bian',
  '灬': 'biao', '憋': 'bie', '汃': 'bin', '冫': 'bing', '癶': 'bo',
  '峬': 'bu', '嚓': 'ca', '偲': 'cai', '参': 'can', '仓': 'cang',
  '撡': 'cao', '冊': 'ce', '嵾': 'cen', '曽': 'ceng', '叉': 'cha',
  '芆': 'chai', '辿': 'chan', '伥': 'chang', '抄': 'chao', '车': 'che',
  '抻': 'chen', '阷': 'cheng', '吃': 'chi', '充': 'chong', '抽': 'chou',
  '出': 'chu', '欻': 'chua', '揣': 'chuai', '巛': 'chuan', '刅': 'chuang',
  '吹': 'chui', '旾': 'chun', '逴': 'chuo', '呲': 'ci', '匆': 'cong',
  '凑': 'cou', '粗': 'cu', '汆': 'cuan', '崔': 'cui', '邨': 'cun',
  '搓': 'cuo', '咑': 'da', '呆': 'dai', '丹': 'dan', '当': 'dang',
  '刀': 'dao', '嘚': 'de', '扥': 'dun', '灯': 'deng', '氐': 'di',
  '甸': 'dian', '刁': 'diao', '爹': 'die', '丁': 'ding', '丟': 'diu',
  '东': 'dong', '吺': 'dou', '厾': 'du', '耑': 'duan', '垖': 'dui',
  '吨': 'dun', '多': 'duo', '妸': 'e', '诶': 'ei', '奀': 'en',
  '鞥': 'eng', '儿': 'er', '发': 'fa', '帆': 'fan', '匚': 'fang',
  '飞': 'fei', '分': 'fen', '丰': 'feng', '覅': 'fiao', '仏': 'fo',
  '紑': 'fou', '夫': 'fu', '旮': 'ga', '侅': 'gai', '甘': 'gan',
  '冈': 'gang', '皋': 'gao', '戈': 'ge', '给': 'gei', '根': 'gen',
  '刯': 'geng', '工': 'gong', '勾': 'gou', '估': 'gu', '瓜': 'gua',
  '乖': 'guai', '关': 'guan', '光': 'guang', '归': 'gui', '丨': 'gun',
  '呙': 'guo', '哈': 'ha', '咍': 'hai', '佄': 'han', '夯': 'hang',
  '茠': 'hao', '诃': 'he', '黒': 'hei', '拫': 'hen', '亨': 'heng',
  '噷': 'hm', '叿': 'hong', '齁': 'hou', '乎': 'hu', '花': 'hua',
  '怀': 'huai', '欢': 'huan', '巟': 'huang', '灰': 'hui', '昏': 'hun',
  '吙': 'huo', '丌': 'ji', '加': 'jia', '戋': 'jian', '江': 'jiang',
  '艽': 'jiao', '阶': 'jie', '巾': 'jin', '坕': 'jing', '冂': 'jiong',
  '丩': 'jiu', '凥': 'ju', '姢': 'juan', '噘': 'jue', '军': 'jun',
  '咔': 'ka', '开': 'kai', '刊': 'kan', '忼': 'kang', '尻': 'kao',
  '匼': 'ke', '肎': 'ken', '劥': 'keng', '空': 'kong', '抠': 'kou',
  '扝': 'ku', '夸': 'kua', '蒯': 'kuai', '宽': 'kuan', '匡': 'kuang',
  '亏': 'kui', '坤': 'kun', '扩': 'kuo', '垃': 'la', '来': 'lai',
  '兰': 'lan', '啷': 'lang', '捞': 'lao', '肋': 'le', '勒': 'lei',
  '崚': 'leng', '哩': 'li', '俩': 'lia', '奁': 'lian', '良': 'liang',
  '撩': 'liao', '毟': 'lie', '拎': 'lin', '伶': 'ling', '溜': 'liu',
  '囖': 'lo', '龙': 'long', '瞜': 'lou', '噜': 'lu', '驴': 'lv',
  '娈': 'luan', '掠': 'lue', '抡': 'lun', '罗': 'luo', '呣': 'm',
  '妈': 'ma', '埋': 'mai', '嫚': 'man', '牤': 'mang', '猫': 'mao',
  '嚒': 'me', '呅': 'mei', '椚': 'men', '擝': 'meng', '咪': 'mi',
  '宀': 'mian', '喵': 'miao', '乜': 'mie', '民': 'min', '名': 'ming',
  '谬': 'miu', '摸': 'mo', '哞': 'mou', '毪': 'mu', '嗯': 'ng',
  '拏': 'na', '腉': 'nai', '囡': 'nan', '囔': 'nang', '孬': 'nao',
  '疒': 'ne', '娞': 'nei', '恁': 'nen', '能': 'neng', '妮': 'ni',
  '拈': 'nian', '娘': 'niang', '鸟': 'niao', '捏': 'nie', '囜': 'nin',
  '宁': 'ning', '妞': 'niu', '农': 'nong', '羺': 'nou', '奴': 'nu',
  '女': 'nv', '奻': 'nuan', '疟': 'nue', '黁': 'nun', '挪': 'nuo',
  '喔': 'o', '讴': 'ou', '妑': 'pa', '拍': 'pai', '眅': 'pan',
  '乓': 'pang', '抛': 'pao', '呸': 'pei', '喷': 'pen', '匉': 'peng',
  '丕': 'pi', '囨': 'pian', '剽': 'piao', '氕': 'pie', '姘': 'pin',
  '乒': 'ping', '钋': 'po', '剖': 'pou', '仆': 'pu', '七': 'qi',
  '掐': 'qia', '千': 'qian', '呛': 'qiang', '悄': 'qiao', '苆': 'qie',
  '亲': 'qin', '靑': 'qing', '卭': 'qiong', '丘': 'qiu', '区': 'qu',
  '奍': 'quan', '缺': 'que', '夋': 'qun', '呥': 'ran', '穣': 'rang',
  '娆': 'rao', '惹': 're', '人': 'ren', '扔': 'reng', '日': 'ri',
  '茸': 'rong', '厹': 'rou', '邚': 'ru', '挼': 'rua', '堧': 'ruan',
  '婑': 'rui', '瞤': 'run', '捼': 'ruo', '仨': 'sa', '毢': 'sai',
  '三': 'san', '桒': 'sang', '掻': 'sao', '閪': 'se', '森': 'sen',
  '僧': 'seng', '杀': 'sha', '筛': 'shai', '山': 'shan', '伤': 'shang',
  '弰': 'shao', '奢': 'she', '申': 'shen', '升': 'sheng', '尸': 'shi',
  '収': 'shou', '书': 'shu', '刷': 'shua', '衰': 'shuai', '闩': 'shuan',
  '双': 'shuang', '脽': 'shui', '吮': 'shun', '说': 'shuo', '厶': 'si',
  '忪': 'song', '凁': 'sou', '苏': 'su', '狻': 'suan', '夊': 'sui',
  '孙': 'sun', '唆': 'suo', '他': 'ta', '囼': 'tai', '坍': 'tan',
  '汤': 'tang', '夲': 'tao', '忑': 'te', '熥': 'teng', '剔': 'ti',
  '天': 'tian', '旫': 'tiao', '帖': 'tie', '厅': 'ting', '囲': 'tong',
  '偷': 'tou', '凸': 'tu', '湍': 'tuan', '推': 'tui', '吞': 'tun',
  '乇': 'tuo', '屲': 'wa', '歪': 'wai', '弯': 'wan', '尣': 'wang',
  '危': 'wei', '昷': 'wen', '翁': 'weng', '挝': 'wo', '乌': 'wu',
  '夕': 'xi', '虲': 'xia', '仙': 'xian', '乡': 'xiang', '灱': 'xiao',
  '些': 'xie', '心': 'xin', '星': 'xing', '凶': 'xiong', '休': 'xiu',
  '吁': 'xu', '吅': 'xuan', '削': 'xue', '坃': 'xun', '丫': 'ya',
  '恹': 'yan', '央': 'yang', '幺': 'yao', '倻': 'ye', '一': 'yi',
  '囙': 'yin', '应': 'ying', '哟': 'yo', '佣': 'yong', '优': 'you',
  '込': 'yu', '囦': 'yuan', '曰': 'yue', '晕': 'yun', '帀': 'za',
  '災': 'zai', '兂': 'zan', '匨': 'zang', '傮': 'zao', '则': 'ze',
  '贼': 'zei', '怎': 'zen', '増': 'zeng', '扎': 'zha', '夈': 'zhai',
  '枬': 'zhan', '张': 'zhang', '佋': 'zhao', '蜇': 'zhe', '贞': 'zhen',
  '凧': 'zheng', '之': 'zhi', '中': 'zhong', '州': 'zhou', '朱': 'zhu',
  '抓': 'zhua', '拽': 'zhuai', '专': 'zhuan', '妆': 'zhuang', '隹': 'zhui',
  '宒': 'zhun', '卓': 'zhuo', '乲': 'zi', '宗': 'zong', '邹': 'zou',
  '租': 'zu', '钻': 'zuan', '厜': 'zui', '尊': 'zun', '昨': 'zuo',
}

const hans = Object.keys(dictionary)
const cache = Object.assign({}, dictionary)
const collator = new Intl.Collator(['zh-CN'])

function pinyin(target) {
  if (typeof target !== 'string') {
    return target
  }
  if (target.length > 1) {
    return target.split('').map(pinyin).join(' ')
  }
  const code = target.charCodeAt(0)
  if (code < 0x4e00 || code > 0x9FA5) {
    return target
  }
  if (cache[target]) {
    return cache[target]
  }
  let index = -1
  let result = null
  let start = 0
  let end = hans.length - 1
  while (start <= end) {
    index = Math.floor((start + end) / 2)
    const character = hans[index]
    result = collator.compare(target, character)
    if (result === 0) {
      break
    } else if (result === 1) {
      start = index + 1
    } else if (result === -1) {
      end = index - 1
    }
  }
  if (result < 0) {
    index -= 1
  }
  const character = hans[index]
  cache[target] = dictionary[character]
  return cache[target]
}

export default pinyin
