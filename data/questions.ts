export interface Question {
  id: number;
  question: string;
  options: string[];
  correct: number | number[];
  type: 'single' | 'multiple' | 'judgment' | 'scenario';
  required?: boolean;
  note?: string;
  score: number;
  tag?: string;
}

export interface QuestionCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  questions: Question[];
  requireUpload?: boolean;
  totalScore: number;
  passScore: number;
}

export const questionCategories: QuestionCategory[] = [
  {
    id: 'building',
    name: '建筑',
    description: '',
    icon: '🏠',
    requireUpload: true,
    totalScore: 100,
    passScore: 60,
    questions: [
      { id: 1, question: '以下哪种方块最适合做地基？', options: ['泥土', '石头', '木板', '玻璃'], correct: 1, type: 'single', score: 5, tag: '基础' },
      { id: 2, question: '以下哪种颜色最适合作为主要建筑色？', options: ['红色', '蓝色', '白色', '绿色'], correct: 2, type: 'single', score: 5, tag: '基础' },
      { id: 3, question: '以下哪种方块不适合做屋顶？', options: ['台阶', '楼梯', '完整方块', '玻璃'], correct: 3, type: 'single', score: 5, tag: '基础' },
      { id: 4, question: '如何让房子更美观？', options: ['只用一种方块', '使用多种方块组合', '不做装饰', '以上都不对'], correct: 1, type: 'single', score: 5, tag: '进阶' },
      { id: 5, question: '以下哪种材料最适合做窗户？', options: ['石头', '玻璃', '木板', '泥土'], correct: 1, type: 'single', score: 5, tag: '基础' },
      { id: 6, question: '以下哪种方块适合做装饰性柱子？', options: ['木头', '石头', '钻石块', '以上都可以'], correct: 3, type: 'single', score: 5, tag: '进阶' },
      { id: 7, question: '建筑时最重要的是什么？', options: ['材料', '创意', '时间', '以上都重要'], correct: 3, type: 'single', score: 5, tag: '进阶' },
      { id: 8, question: '以下哪种方块适合做地板？', options: ['木板', '石头', '地毯', '以上都可以'], correct: 3, type: 'single', score: 5, tag: '基础' },
      { id: 9, question: '以下哪些方块适合做建筑主体？', options: ['石头', '木板', '砖块', '以上都可以'], correct: [0, 1, 2, 3], type: 'multiple', score: 10, tag: '基础' },
      { id: 10, question: '以下哪些方块适合做装饰？', options: ['花', '草', '树叶', '以上都可以'], correct: [0, 1, 2, 3], type: 'multiple', score: 10, tag: '进阶' },
      { id: 11, question: '以下哪些方块适合做屋顶？', options: ['台阶', '楼梯', '完整方块', '以上都可以'], correct: [0, 1, 2], type: 'multiple', score: 10, tag: '进阶' },
      { id: 12, question: '以下哪些颜色搭配比较美观？', options: ['白色+蓝色', '红色+黄色', '绿色+棕色', '以上都可以'], correct: [0, 1, 2, 3], type: 'multiple', score: 10, tag: '进阶' },
      { id: 13, question: '窗户是建筑的重要组成部分。', options: ['正确', '错误'], correct: 0, type: 'judgment', score: 10, tag: '基础' },
      { id: 14, question: '建筑只需要实用，不需要美观。', options: ['正确', '错误'], correct: 1, type: 'judgment', score: 10, tag: '进阶' },
      { id: 15, question: '【实景应用题】请在服务器中建造一个简单的小房子（本题不参与评分，仅展示能力）', options: ['请上传作品'], correct: 0, type: 'scenario', score: 0, tag: '实景' },
    ]
  },
  {
    id: 'survival',
    name: '生存',
    description: '',
    icon: '⛏️',
    totalScore: 100,
    passScore: 60,
    questions: [
      { id: 1, question: '以下哪种工具挖掘石头最快？', options: ['木镐', '石镐', '铁镐', '钻石镐'], correct: 3, type: 'single', score: 3, tag: '基础' },
      { id: 2, question: '如何获得末影珍珠？', options: ['击杀末影人', '挖掘末地石', '与村民交易', '以上都可以'], correct: 3, type: 'single', score: 3, tag: '基础' },
      { id: 3, question: '以下哪种生物会主动攻击玩家？', options: ['猪', '羊', '僵尸', '牛'], correct: 2, type: 'single', score: 3, tag: '基础' },
      { id: 4, question: '如何制作床？', options: ['3个羊毛+3个木板', '2个羊毛+4个木板', '3个羊毛+2个木板', '4个羊毛+2个木板'], correct: 0, type: 'single', score: 3, tag: '基础' },
      { id: 5, question: '以下哪种矿物只能在下界找到？', options: ['铁矿石', '金矿石', '下界石英矿石', '钻石矿石'], correct: 2, type: 'single', score: 3, tag: '进阶' },
      { id: 6, question: '如何获得龙蛋？', options: ['击杀末影龙', '挖掘末地石', '末地城宝箱', '与村民交易'], correct: 0, type: 'single', score: 3, tag: '进阶' },
      { id: 7, question: '以下哪种药水可以让玩家在水下呼吸？', options: ['水肺药水', '夜视药水', '隐身药水', '迅捷药水'], correct: 0, type: 'single', score: 3, tag: '进阶' },
      { id: 8, question: '如何获得信标？', options: ['击杀凋灵', '合成', '地牢宝箱', '与村民交易'], correct: 1, type: 'single', score: 3, tag: '进阶' },
      { id: 9, question: '如何获得鞘翅？', options: ['击杀末影龙', '末地船', '末地城宝箱', '与村民交易'], correct: 1, type: 'single', score: 3, tag: '进阶' },
      { id: 10, question: '以下哪种生物可以驯服？', options: ['僵尸', '骷髅', '狼', '末影人'], correct: 2, type: 'single', score: 3, tag: '基础' },
      { id: 11, question: '如何获得不死图腾？', options: ['击杀唤魔者', '林地府邸宝箱', '与村民交易', '以上都可以'], correct: 0, type: 'single', score: 3, tag: '进阶' },
      { id: 12, question: '以下哪种食物可以用来繁殖猪？', options: ['小麦', '胡萝卜', '种子', '苹果'], correct: 1, type: 'single', score: 3, tag: '基础' },
      { id: 13, question: '如何获得海绵？', options: ['击杀守卫者', '海底神殿', '与流浪商人交易', '以上都可以'], correct: 1, type: 'single', score: 3, tag: '进阶' },
      { id: 14, question: '以下哪种药水可以治疗僵尸村民？', options: ['治疗药水', '虚弱药水+金苹果', '再生药水', '力量药水'], correct: 1, type: 'single', score: 3, tag: '进阶' },
      { id: 15, question: '如何获得三叉戟？', options: ['击杀溺尸', '钓鱼', '海底遗迹', '与村民交易'], correct: 0, type: 'single', score: 3, tag: '进阶' },
      { id: 16, question: '以下哪种方块可以用来制作信标基座？', options: ['铁块', '金块', '钻石块', '以上都可以'], correct: 3, type: 'single', score: 3, tag: '进阶' },
      { id: 17, question: '如何获得海洋之心？', options: ['击杀溺尸', '海底神殿宝箱', '钓鱼', '与村民交易'], correct: 1, type: 'single', score: 3, tag: '进阶' },
      { id: 18, question: '以下哪种生物会爆炸？', options: ['僵尸', '骷髅', '苦力怕', '末影人'], correct: 2, type: 'single', score: 3, tag: '基础' },
      { id: 19, question: '以下哪些生物会在夜间生成？', options: ['僵尸', '骷髅', '苦力怕', '末影人'], correct: [0, 1, 2, 3], type: 'multiple', score: 5, tag: '基础' },
      { id: 20, question: '以下哪些食物可以恢复饥饿值？', options: ['面包', '牛排', '苹果', '胡萝卜'], correct: [0, 1, 2, 3], type: 'multiple', score: 5, tag: '基础' },
      { id: 21, question: '以下哪些矿物可以在主世界找到？', options: ['铁矿石', '金矿石', '钻石矿石', '煤矿石'], correct: [0, 1, 2, 3], type: 'multiple', score: 5, tag: '基础' },
      { id: 22, question: '以下哪些生物可以驯服？', options: ['狼', '猫', '马', '鹦鹉'], correct: [0, 1, 2, 3], type: 'multiple', score: 5, tag: '进阶' },
      { id: 23, question: '以下哪些方块可以用来制作传送门？', options: ['黑曜石', '末地传送门框架', '哭泣的黑曜石', '基岩'], correct: [0, 1], type: 'multiple', score: 5, tag: '进阶' },
      { id: 24, question: '以下哪些药水对玩家有益？', options: ['治疗药水', '迅捷药水', '夜视药水', '隐身药水'], correct: [0, 1, 2, 3], type: 'multiple', score: 5, tag: '进阶' },
      { id: 25, question: '床可以跳过夜晚。', options: ['正确', '错误'], correct: 0, type: 'judgment', score: 4, tag: '基础' },
      { id: 26, question: '钻石是最稀有的矿物。', options: ['正确', '错误'], correct: 0, type: 'judgment', score: 4, tag: '基础' },
      { id: 27, question: '末影人会拿取方块。', options: ['正确', '错误'], correct: 0, type: 'judgment', score: 4, tag: '基础' },
      { id: 28, question: '村民可以交易。', options: ['正确', '错误'], correct: 0, type: 'judgment', score: 4, tag: '基础' },
      { id: 29, question: '【实景应用题】请在生存模式下建造一个简单的庇护所（本题不参与评分，仅展示能力）', options: ['请上传作品'], correct: 0, type: 'scenario', score: 0, tag: '实景' },
      { id: 30, question: '【实景应用题】请在生存模式下制作一把钻石剑（本题不参与评分，仅展示能力）', options: ['请上传作品'], correct: 0, type: 'scenario', score: 0, tag: '实景' },
    ]
  },
  {
    id: 'command',
    name: '指令',
    description: '',
    icon: '💻',
    totalScore: 100,
    passScore: 60,
    questions: [
      { id: 1, question: '以下哪个指令可以获得物品？', options: ['/give', '/tp', '/gamemode', '/time'], correct: 0, type: 'single', score: 3, tag: '基础' },
      { id: 2, question: '以下哪个指令可以传送？', options: ['/give', '/tp', '/gamemode', '/time'], correct: 1, type: 'single', score: 3, tag: '基础' },
      { id: 3, question: '以下哪个指令可以更改游戏模式？', options: ['/give', '/tp', '/gamemode', '/time'], correct: 2, type: 'single', score: 3, tag: '基础' },
      { id: 4, question: '以下哪个指令可以更改时间？', options: ['/give', '/tp', '/gamemode', '/time'], correct: 3, type: 'single', score: 3, tag: '基础' },
      { id: 5, question: '以下哪个指令可以设置出生点？', options: ['/spawnpoint', '/tp', '/gamemode', '/time'], correct: 0, type: 'single', score: 3, tag: '基础' },
      { id: 6, question: '以下哪个指令可以设置天气？', options: ['/weather', '/tp', '/gamemode', '/time'], correct: 0, type: 'single', score: 3, tag: '进阶' },
      { id: 7, question: '以下哪个指令可以杀死实体？', options: ['/kill', '/tp', '/gamemode', '/time'], correct: 0, type: 'single', score: 3, tag: '进阶' },
      { id: 8, question: '以下哪个指令可以生成方块？', options: ['/setblock', '/tp', '/gamemode', '/time'], correct: 0, type: 'single', score: 3, tag: '进阶' },
      { id: 9, question: '以下哪个指令可以填充区域？', options: ['/fill', '/tp', '/gamemode', '/time'], correct: 0, type: 'single', score: 3, tag: '进阶' },
      { id: 10, question: '以下哪个指令可以给予经验？', options: ['/xp', '/tp', '/gamemode', '/time'], correct: 0, type: 'single', score: 3, tag: '进阶' },
      { id: 11, question: '以下哪个指令可以清除物品？', options: ['/clear', '/tp', '/gamemode', '/time'], correct: 0, type: 'single', score: 3, tag: '进阶' },
      { id: 12, question: '以下哪个指令可以设置游戏规则？', options: ['/gamerule', '/tp', '/gamemode', '/time'], correct: 0, type: 'single', score: 3, tag: '进阶' },
      { id: 13, question: '以下哪个指令可以列出玩家？', options: ['/list', '/tp', '/gamemode', '/time'], correct: 0, type: 'single', score: 3, tag: '进阶' },
      { id: 14, question: '以下哪个指令可以发送消息？', options: ['/say', '/tp', '/gamemode', '/time'], correct: 0, type: 'single', score: 3, tag: '进阶' },
      { id: 15, question: '以下哪个指令可以静音？', options: ['/mute', '/tp', '/gamemode', '/time'], correct: 0, type: 'single', score: 3, tag: '进阶' },
      { id: 16, question: '以下哪个指令可以踢出玩家？', options: ['/kick', '/tp', '/gamemode', '/time'], correct: 0, type: 'single', score: 3, tag: '进阶' },
      { id: 17, question: '以下哪个指令可以封禁玩家？', options: ['/ban', '/tp', '/gamemode', '/time'], correct: 0, type: 'single', score: 3, tag: '进阶' },
      { id: 18, question: '以下哪个指令可以封禁IP？', options: ['/ban-ip', '/tp', '/gamemode', '/time'], correct: 0, type: 'single', score: 3, tag: '进阶' },
      { id: 19, question: '以下哪些是常用指令？', options: ['/give', '/tp', '/gamemode', '/time'], correct: [0, 1, 2, 3], type: 'multiple', score: 7, tag: '基础' },
      { id: 20, question: '以下哪些指令可以更改游戏模式？', options: ['/gamemode creative', '/gamemode survival', '/gamemode adventure', '/gamemode spectator'], correct: [0, 1, 2, 3], type: 'multiple', score: 7, tag: '基础' },
      { id: 21, question: '以下哪些指令可以设置时间？', options: ['/time set day', '/time set night', '/time set noon', '/time set midnight'], correct: [0, 1, 2, 3], type: 'multiple', score: 6, tag: '基础' },
      { id: 22, question: '以下哪些指令可以设置天气？', options: ['/weather clear', '/weather rain', '/weather thunder', '/weather snow'], correct: [0, 1, 2], type: 'multiple', score: 6, tag: '进阶' },
      { id: 23, question: '指令需要在聊天框中输入。', options: ['正确', '错误'], correct: 0, type: 'judgment', score: 5, tag: '基础' },
      { id: 24, question: '指令前需要加斜杠。', options: ['正确', '错误'], correct: 0, type: 'judgment', score: 5, tag: '基础' },
      { id: 25, question: '所有服务器都可以使用指令。', options: ['正确', '错误'], correct: 1, type: 'judgment', score: 6, tag: '基础' },
      { id: 26, question: '命令方块可以执行指令。', options: ['正确', '错误'], correct: 0, type: 'judgment', score: 5, tag: '进阶' },
      { id: 27, question: '【实景应用题】请使用/give指令获得一个钻石（本题不参与评分，仅展示能力）', options: ['请上传作品'], correct: 0, type: 'scenario', score: 0, tag: '实景' },
      { id: 28, question: '【实景应用题】请使用/tp指令传送到坐标100 64 100（本题不参与评分，仅展示能力）', options: ['请上传作品'], correct: 0, type: 'scenario', score: 0, tag: '实景' },
      { id: 29, question: '【实景应用题】请使用/gamemode指令切换到创造模式（本题不参与评分，仅展示能力）', options: ['请上传作品'], correct: 0, type: 'scenario', score: 0, tag: '实景' },
      { id: 30, question: '【实景应用题】请使用/time指令设置时间为白天（本题不参与评分，仅展示能力）', options: ['请上传作品'], correct: 0, type: 'scenario', score: 0, tag: '实景' },
    ]
  },
  {
    id: 'redstone',
    name: '生电',
    description: '',
    icon: '⚡',
    requireUpload: true,
    totalScore: 100,
    passScore: 60,
    questions: [
      { id: 1, question: '红石信号的最大传输距离是多少格？', options: ['8格', '15格', '16格', '32格'], correct: 1, type: 'single', score: 5, tag: '基础' },
      { id: 2, question: '以下哪种方块可以传输红石信号？', options: ['石头', '红石块', '泥土', '木板'], correct: 1, type: 'single', score: 5, tag: '基础' },
      { id: 3, question: '以下哪种方块可以给红石充能？', options: ['红石块', '火把', '按钮', '以上都可以'], correct: 3, type: 'single', score: 5, tag: '基础' },
      { id: 4, question: '以下哪种物品可以延长红石信号？', options: ['红石中继器', '红石比较器', '红石灯', '以上都可以'], correct: 0, type: 'single', score: 5, tag: '进阶' },
      { id: 5, question: '以下哪种物品可以比较红石信号强度？', options: ['红石中继器', '红石比较器', '红石灯', '以上都可以'], correct: 1, type: 'single', score: 5, tag: '进阶' },
      { id: 6, question: '以下哪种物品可以显示红石信号？', options: ['红石中继器', '红石比较器', '红石灯', '以上都可以'], correct: 2, type: 'single', score: 5, tag: '基础' },
      { id: 7, question: '以下哪种物品可以激活活塞？', options: ['按钮', '拉杆', '压力板', '以上都可以'], correct: 3, type: 'single', score: 5, tag: '基础' },
      { id: 8, question: '以下哪种物品可以制作时钟信号？', options: ['红石中继器', '红石比较器', '漏斗', '以上都可以'], correct: 0, type: 'single', score: 5, tag: '进阶' },
      { id: 9, question: '以下哪些是红石元件？', options: ['红石火把', '红石中继器', '红石比较器', '以上都是'], correct: [0, 1, 2], type: 'multiple', score: 10, tag: '基础' },
      { id: 10, question: '以下哪些可以激活红石？', options: ['按钮', '拉杆', '压力板', '以上都是'], correct: [0, 1, 2, 3], type: 'multiple', score: 10, tag: '基础' },
      { id: 11, question: '以下哪些方块可以传输红石？', options: ['红石块', '石头', '木板', '以上都是'], correct: [0], type: 'multiple', score: 10, tag: '基础' },
      { id: 12, question: '以下哪些物品与红石有关？', options: ['活塞', '观察者', '漏斗', '以上都是'], correct: [0, 1, 2, 3], type: 'multiple', score: 10, tag: '进阶' },
      { id: 13, question: '红石是Minecraft的重要组成部分。', options: ['正确', '错误'], correct: 0, type: 'judgment', score: 10, tag: '基础' },
      { id: 14, question: '生电很有趣。', options: ['正确', '错误'], correct: 0, type: 'judgment', score: 10, tag: '基础' },
      { id: 15, question: '【实景应用题】请制作一个简单的红石灯开关（本题不参与评分，仅展示能力）', options: ['请上传作品'], correct: 0, type: 'scenario', score: 0, tag: '实景' },
    ]
  },
  {
    id: 'enchanting',
    name: '附魔与酿造',
    description: '',
    icon: '✨',
    totalScore: 100,
    passScore: 60,
    questions: [
      { id: 1, question: '附魔台需要什么材料制作？', options: ['黑曜石+钻石+书', '黑曜石+铁锭+书', '石头+钻石+书', '石头+铁锭+书'], correct: 0, type: 'single', score: 3, tag: '基础' },
      { id: 2, question: '附魔台周围需要放置什么来增加附魔等级？', options: ['书架', '附魔台', '箱子', '火把'], correct: 0, type: 'single', score: 3, tag: '基础' },
      { id: 3, question: '最高附魔等级是多少？', options: ['20级', '25级', '30级', '35级'], correct: 2, type: 'single', score: 3, tag: '基础' },
      { id: 4, question: '以下哪种附魔可以保护玩家免受爆炸伤害？', options: ['保护', '火焰保护', '爆炸保护', '弹射物保护'], correct: 2, type: 'single', score: 3, tag: '进阶' },
      { id: 5, question: '以下哪种附魔可以让玩家在水下呼吸更久？', options: ['水下呼吸', '深海探索者', '冰霜行者', '灵魂疾行'], correct: 0, type: 'single', score: 3, tag: '进阶' },
      { id: 6, question: '以下哪种附魔可以让玩家在岩浆上行走？', options: ['冰霜行者', '灵魂疾行', '深海探索者', '以上都不行'], correct: 3, type: 'single', score: 3, tag: '进阶' },
      { id: 7, question: '以下哪种附魔可以让玩家挖掘更快？', options: ['效率', '耐久', '精准采集', '时运'], correct: 0, type: 'single', score: 3, tag: '基础' },
      { id: 8, question: '以下哪种附魔可以让玩家获得更多掉落物？', options: ['效率', '耐久', '精准采集', '时运'], correct: 3, type: 'single', score: 3, tag: '基础' },
      { id: 9, question: '以下哪种附魔可以让玩家采集方块本身？', options: ['效率', '耐久', '精准采集', '时运'], correct: 2, type: 'single', score: 3, tag: '进阶' },
      { id: 10, question: '以下哪种附魔可以让玩家击退敌人？', options: ['锋利', '击退', '火焰附加', '抢夺'], correct: 1, type: 'single', score: 3, tag: '基础' },
      { id: 11, question: '酿造台需要什么材料制作？', options: ['圆石+烈焰棒', '木板+烈焰棒', '石头+烈焰棒', '铁锭+烈焰棒'], correct: 0, type: 'single', score: 3, tag: '基础' },
      { id: 12, question: '酿造药水的第一步需要什么？', options: ['水瓶', '地狱疣', '烈焰粉', '红石'], correct: 1, type: 'single', score: 3, tag: '基础' },
      { id: 13, question: '以下哪种材料可以延长药水效果时间？', options: ['红石', '萤石', '火药', '龙息'], correct: 0, type: 'single', score: 3, tag: '进阶' },
      { id: 14, question: '以下哪种材料可以增强药水效果？', options: ['红石', '萤石', '火药', '龙息'], correct: 1, type: 'single', score: 3, tag: '进阶' },
      { id: 15, question: '以下哪种材料可以将药水变成喷溅药水？', options: ['红石', '萤石', '火药', '龙息'], correct: 2, type: 'single', score: 3, tag: '进阶' },
      { id: 16, question: '以下哪种材料可以将药水变成滞留药水？', options: ['红石', '萤石', '火药', '龙息'], correct: 3, type: 'single', score: 3, tag: '进阶' },
      { id: 17, question: '治疗药水需要什么材料制作？', options: ['闪烁的西瓜', '金胡萝卜', '岩浆膏', '糖'], correct: 0, type: 'single', score: 3, tag: '基础' },
      { id: 18, question: '夜视药水需要什么材料制作？', options: ['闪烁的西瓜', '金胡萝卜', '岩浆膏', '糖'], correct: 1, type: 'single', score: 3, tag: '基础' },
      { id: 19, question: '以下哪些材料可以用于附魔？', options: ['青金石', '附魔书', '铁砧', '附魔台'], correct: [0, 1, 2, 3], type: 'multiple', score: 5, tag: '基础' },
      { id: 20, question: '以下哪些附魔适用于武器？', options: ['锋利', '击退', '火焰附加', '抢夺'], correct: [0, 1, 2, 3], type: 'multiple', score: 6, tag: '基础' },
      { id: 21, question: '以下哪些附魔适用于盔甲？', options: ['保护', '火焰保护', '爆炸保护', '弹射物保护'], correct: [0, 1, 2, 3], type: 'multiple', score: 5, tag: '进阶' },
      { id: 22, question: '以下哪些附魔适用于工具？', options: ['效率', '耐久', '精准采集', '时运'], correct: [0, 1, 2, 3], type: 'multiple', score: 6, tag: '基础' },
      { id: 23, question: '附魔台需要黑曜石和钻石制作。', options: ['正确', '错误'], correct: 0, type: 'judgment', score: 4, tag: '基础' },
      { id: 24, question: '书架可以增加附魔等级。', options: ['正确', '错误'], correct: 0, type: 'judgment', score: 5, tag: '基础' },
      { id: 25, question: '最高附魔等级是30级。', options: ['正确', '错误'], correct: 0, type: 'judgment', score: 5, tag: '基础' },
      { id: 26, question: '青金石是附魔的必需材料。', options: ['正确', '错误'], correct: 0, type: 'judgment', score: 5, tag: '基础' },
      { id: 27, question: '铁砧可以用来合并附魔。', options: ['正确', '错误'], correct: 0, type: 'judgment', score: 5, tag: '进阶' },
      { id: 28, question: '【实景应用题】请制作一瓶治疗药水（本题不参与评分，仅展示能力）', options: ['请上传作品'], correct: 0, type: 'scenario', score: 0, tag: '实景' },
      { id: 29, question: '【实景应用题】请给一把钻石剑附魔锋利（本题不参与评分，仅展示能力）', options: ['请上传作品'], correct: 0, type: 'scenario', score: 0, tag: '实景' },
      { id: 30, question: '【实景应用题】请制作一个完整的附魔室（本题不参与评分，仅展示能力）', options: ['请上传作品'], correct: 0, type: 'scenario', score: 0, tag: '实景' },
    ]
  }
];
