//容易爆验证码，谨慎使用，米游社的面板数据有些许偏差
//2024-10-14 目前只写了4星5星的圣遗物识别
import ProfileList from '../system/copy/ProfileList.js'
import fs from 'node:fs'
import {yaml,MysInfo} from '#xiaokeli'
import { Restart } from '../../other/restart.js'
import moment from 'moment';


export class mysmb extends plugin {
	constructor () {
		super({
			/** 功能名称 */
			name: '[小可莉]米游社更新面板',
			/** 功能描述 */
			dsc: '',
			/** https://oicqjs.github.io/oicq/#events */
			event: 'message',
			/** 优先级，数字越小等级越高 */
			priority: -1,
			rule: [
				{
					/** 命令正则匹配 */
					reg: '^#?(小可莉|米游社|m)更新面板$',
					/** 执行方法 */
					fnc: 'mys'
				},{
					/** 命令正则匹配 */
					reg: '^#?小可莉面板文件(替换|还原)$',
					/** 执行方法 */
					fnc: 'mbwj'
				},
			]
		});
	}
async mys(e){
if(fs.existsSync('./plugins/xiaokeli/system/copy/ProfileAvatar.js')){
 if (!e.isMaster) return false
 e.reply('首次使用该功能，需要修改喵佬的models/avatar/ProfileAvatar.js文件,请发送：小可莉面板文件替换\n\n后续更新miao-plugin，如果因为该文件引发冲突，可使用:小可莉面板文件还原')
 return false
}
let CD=(await yaml.get('./plugins/xiaokeli/config/config.yaml')).mbCD
let uid= e.user.getUid()
if(!uid) return e.reply('找不到uid,请：刷新ck 或者 #扫码登录', true)

let now
if(CD>0){
now = moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
    let time_ = await redis.get(`xkl:mysCD:${uid}`);
    // if (time_ &&!this.e.isMaster ) {
    if (time_) {
      let seconds = moment(now).diff(moment(time_), 'seconds')
      this.e.reply(`UID：${uid}\n米游社更新面板cd中\n还需等待：${CD - seconds}秒`)
      return true
}
}
this.e.game='gs'


   let device_fp = await MysInfo.get(this.e, 'getFp')
    let headers = { 'x-rpc-device_fp': device_fp?.data?.device_fp }
    let res = await MysInfo.get(this.e, 'character', { headers})
    if(!res.data) return logger.mark('米游社查询失败')
    let ids=[]
  res.data.list.map((value) => {
    ids.push(value.id)
    })
let data = await MysInfo.get(this.e, 'character_detail', { headers,ids:ids})
if(!data.data) return logger.mark('米游社查询失败')
let avatars={}
this.property_map=data.data.property_map

let url=`./data/PlayerData/gs/${uid}.json`
let mb={
  "uid": `${uid}`,
  "game": "gs",
  "avatars": {}
}

if (fs.existsSync(url)) {
mb=JSON.parse(fs.readFileSync(url,'utf8'))
}


data.data.list.map((v)=>{
var va=v.base
//promote
let pro
if(va.level>80) pro=6
else if(va.level>70) pro=5
else if(va.level>60) pro=4
else if(va.level>50) pro=3
else if(va.level>40) pro=2
else if(va.level>20) pro=1
else if(va.level>0) pro=0
//命座影响天赋
let ava=JSON.parse(fs.readFileSync(`./plugins/miao-plugin/resources/meta-gs/character/${va.name}/data.json`, 'utf-8'))
let n
let a=v.skills[0].level
let e=v.skills[1].level
let q=v.skills[2].level
//绫华，莫娜
if(va.id=='10000002'||va.id=='10000041') q=v.skills[3].level
if(va.actived_constellation_num>4){
n=Object.values(ava.talentCons).indexOf(5)
 switch (Object.keys(ava.talentCons)[n]) {
    case 'a': 
    a=a-3
      break
    case 'e': 
    e=e-3
      break
    case 'q': 
    q=q-3
      break
    default:
    }
}
if(va.actived_constellation_num>2){
n=Object.values(ava.talentCons).indexOf(3)
 switch (Object.keys(ava.talentCons)[n]) {
    case 'a': 
    a=a-3
      break
    case 'e': 
    e=e-3
      break
    case 'q': 
    q=q-3
      break
    default:
    }
}
//处理达达鸭天赋
if(va.id=='10000033') a--
//处理旅行者
if(va.id=='10000005') va.name='空'
if(va.id=='10000007') va.name='荧'
let costume=0
if(mb.avatars[va.id]?.costume) costume=mb.avatars[va.id].costume
avatars[va.id]={
'name':va.name,
'id':va.id,
'elem':va.element.toLowerCase(),//小写
'level':va.level,
'promote':pro,
'fetter':va.fetter,
'costume': costume,
'cons':va.actived_constellation_num,
'talent':{
          'a':a,
          'e':e,
          'q':q
           },
'weapon':{
        "name":v.weapon.name,
        "level":v.weapon.level,
        "promote":v.weapon.promote_level,
        "affix": v.weapon.affix_level
           },
       "_source": 'mys',
      "_time": new Date().getTime(),
      "_update": new Date().getTime(),
      "_talent": new Date().getTime(),
}
let relics={}
if(v.relics.length){
//mainld_lists
let list1={
 '生命值百分比': '10002',
 '元素充能效率': '10007',
 '攻击力百分比': '10004',
 '防御力百分比': '10006',
      '元素精通': '10008'
}
let list2={
     '生命值百分比': '15002',
     '攻击力百分比': '15004',
     '防御力百分比': '15006',
          '元素精通': '15007',
     '物理伤害加成': '15015',
  '冰元素伤害加成': '15010',
  '岩元素伤害加成': '15013',
  '火元素伤害加成': '15008',
  '水元素伤害加成': '15011',
  '风元素伤害加成': '15012',
  '雷元素伤害加成': '15009',
  '草元素伤害加成': '15014'
}
let list3={
 '生命值百分比': '13002',
 '攻击力百分比': '13004',
 '防御力百分比': '13006',
      '元素精通': '13010',
         '暴击率': '13007',
      '暴击伤害': '13008',
      '治疗加成': '13009'
}
//attrIds[attrld,value最低位，平均差值] 5星
let attrlds={
 '暴击伤害': ['501221','0.0544','0.00768'],
   '暴击率': ['501201','0.0272','0.00378'],
  '攻击力百分比': ['501061','0.0408','0.00579'],
  '生命值百分比': ['501031','0.0408','0.00579'],
  '防御力百分比': ['501091','0.0510','0.00729'],
  '生命值': ['501021','209.13','29.85'],
  '攻击力': ['501051','13.62','1.93'],
  '防御力': ['501081','16.20','2.31'],
  '元素精通': ['501241','16.32','2.325'],
  '元素充能效率': ['501231','0.0453','0.00645']
}
//屎山代码了,逆推attrIds
for (var val of v.relics){
if(val.rarity>3){
//仅支持4星 5星圣遗物
if(val.rarity==4){
////attrIds[attrld,value最低位，平均差值] 4星
attrlds={
 '暴击伤害': ['401221',' 0.043499','0.00619'],
   '暴击率': ['401201','0.0218','0.00305'],
  '攻击力百分比': ['401061','0.0326','0.0046'],
  '生命值百分比': ['401031','0.0326','0.0046'],
  '防御力百分比': ['401091','0.0408','0.00579'],
  '生命值': ['401021','167.3','23.89'],
  '攻击力': ['401051','10.89','1.5'],
  '防御力': ['401081',' 12.96','1.848'],
  '元素精通': ['401241','13.06','1.85'],
  '元素充能效率': ['401231','0.03629','0.0051']
}
}
val.attrlds=[]
for(var t =0;t<val.sub_property_list.length;t++){
if(val.sub_property_list[t]) {
let val_=val.sub_property_list[t]
let at=attrlds[this.property_map[val_.property_type].filter_name]
let k
let p=0
let b=0
let times=val_.times+1
//去% ％
if(val_.value.includes('%','％')){
val_.value=Number(val_.value.replace(/%|％/g, '').trim())/100
}else{
val_.value=Number(val_.value)
}
//利用勾股定理，乘法口诀表，心算，氢氦锂铍硼，重力势能转换，生物链等等原理，逆推attrIds，反正狗屎代码
if(val_.value-Number(at[1])*times <= 0){ k=0}
else
{
k=(val_.value-Number(at[1])*times)/Number(at[2])
if(k.toString().indexOf('.')!= -1){b=Math.floor((k-Math.floor(k))*100)}
if(b>50) k=Math.ceil(k)
else k=Math.floor(k)
p=k%times
}
if(k>=times*3){
for(var i=0;i<times;i++){
val.attrlds.push(Number(at[0])+3)
}}else if(k>=times*2){
for(var i=0;i<times-p;i++){
val.attrlds.push(Number(at[0])+2)
}
for(var g=0;g<p;g++){
val.attrlds.push(Number(at[0])+3)
}
}else if(k>=times){
for(var i=0;i<times-p;i++){
val.attrlds.push(Number(at[0])+1)
}
for(var g=0;g<p;g++){
val.attrlds.push(Number(at[0])+2)
}
}else if(k>=0){
for(var i=0;i<times-k;i++){
val.attrlds.push(Number(at[0]))
}
for(var i=0;i<k;i++){
val.attrlds.push(Number(at[0])+1)
}
}
}
}
 switch (val.pos_name) {
    case '生之花': 
    relics['1']={
          "level": val.level,
          "name": val.name,
          "star": val.rarity,
          "mainId": 14001,
         "attrIds": val.attrlds,
              }
        break
    case '死之羽': 
    relics['2']={
          "level": val.level,
          "name": val.name,
          "star": val.rarity,
          "mainId": 12001,
          "attrIds": val.attrlds
          }
      break
    case '时之沙': 
    relics['3']={
          "level": val.level,
          "name": val.name,
          "star": val.rarity,
          "mainId": list1[this.property_map[val.main_property.property_type].filter_name],
          "attrIds": val.attrlds,
          }
       break
    case '空之杯': 
    relics['4']={
          "level": val.level,
          "name": val.name,
          "star": val.rarity,
          "mainId":  list2[this.property_map[val.main_property.property_type].filter_name],
          "attrIds": val.attrlds,
          }
       break
    case '理之冠': 
    relics['5']={
          "level": val.level,
          "name": val.name,
          "star": val.rarity,
          "mainId":  list3[this.property_map[val.main_property.property_type].filter_name],
          "attrIds": val.attrlds,
          }
      break
    default:
    }
    avatars[va.id]["artis"]=relics
 }
}
}
})
mb.avatars=avatars
mb._profile=new Date().getTime()
fs.writeFileSync(url, JSON.stringify(mb), 'utf-8')
//加载面板列表图
await ProfileList.reload(e)
if(CD>0){
now = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
 await redis.set(`xkl:mysCD:${uid}`, now, {
      EX: CD
    })
}
return true
}

async mbwj(e){
 if (!e.isMaster) return false
  if(e.msg.includes('替换')){
  fs.cpSync('./plugins/miao-plugin/models/avatar/ProfileAvatar.js','./plugins/xiaokeli/system/default/ProfileAvatar_copy.js')
  fs.cpSync('./plugins/xiaokeli/system/copy/ProfileAvatar.js','./plugins/miao-plugin/models/avatar/ProfileAvatar.js')
  fs.unlinkSync('./plugins/xiaokeli/system/copy/ProfileAvatar.js')
  await e.reply('文件替换完成,准备重启~', true)
  new Restart(e).restart()
  return true
  }else{
  if(!fs.existsSync('./plugins/xiaokeli/system/default/ProfileAvatar_copy.js')){
  await e.reply('找不到原文件，是不是被你删了。。。', true)
    return true
  }
  fs.cpSync('./plugins/miao-plugin/models/avatar/ProfileAvatar.js','./plugins/xiaokeli/system/copy/ProfileAvatar.js')
  fs.cpSync('./plugins/xiaokeli/system/default/ProfileAvatar_copy.js','./plugins/miao-plugin/models/avatar/ProfileAvatar.js')
  fs.unlinkSync('./plugins/xiaokeli/system/default/ProfileAvatar_copy.js')
  e.reply('文件还原成功！', true)
  return
  }
}




}
