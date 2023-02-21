// ==UserScript==
// @name         B站小工具
// @version      0.1
// @description  自定义倍速、分p视频计算剩余时间
// @author       xp
// @match        https://www.bilibili.com/video/*
// @icon         https://www.bilibili.com/favicon.ico
// ==/UserScript==


//自定义设置
let config = {
  //自定义倍速列表(视频倍率 4 ~ 0.25)
  rateList: ['3.0','2.5','2.0','1.5','1.0','0.3'],
  //脚本启动时延
  startDelay: 10000,
  shortDelay: 10,
  //全屏时显示时间
  showTime: true,
}

let path = {
  //视频选集列表
  curList: "#multi_page .cur-list .list-box",
  video: "#bilibili-player > div > div > div.bpx-player-primary-area > div.bpx-player-video-area > div.bpx-player-video-perch > div > video",
  //右下角按键盒子位置
  navMenuOld: "#app > div.v-wrap > div:nth-child(3)",
  navMenuNew: "#app > div.video-container-v1 > div.fixed-nav > div",
  //视频进度数字
  onElapsedTime: "#bilibili-player > div > div > div.bpx-player-primary-area > div.bpx-player-video-area > div.bpx-player-control-wrap > div.bpx-player-control-entity > div.bpx-player-control-bottom > div.bpx-player-control-bottom-left > div.bpx-player-ctrl-btn.bpx-player-ctrl-time > div > span.bpx-player-ctrl-time-current",
  //倍速盒子
  playbackrateUl: "#bilibili-player > div > div > div.bpx-player-primary-area > div.bpx-player-video-area > div.bpx-player-control-wrap > div.bpx-player-control-entity > div.bpx-player-control-bottom > div.bpx-player-control-bottom-right > div.bpx-player-ctrl-btn.bpx-player-ctrl-playbackrate > ul",
  //剩余时间按钮
  remainingTimeNew: "#app > div.video-container-v1 > div.fixed-nav > div > div.item.goback.xp",
  remainingTimeOld: "#app > div.v-wrap > div:nth-child(3) > div:nth-child(3)",
  //显示当前时间节点父节点位置
  showTimePNode: "#bilibili-player > div > div > div.bpx-player-primary-area > div.bpx-player-video-area > div.bpx-player-control-wrap > div.bpx-player-control-entity > div.bpx-player-control-bottom > div.bpx-player-control-bottom-left",
}

myInterval = {
  timeInterval: '',
}

/**
 * 时间(hh:mm:ss)转为秒
 */
 function timeToSec(time) {
  let hour = min = sec = 0
  parts = time.split(":")
  if(parts.length === 3) {
    hour = parts[0]
    min = parts[1]
    sec = parts[2]
  } else {
    min = parts[0]
    sec = parts[1]
  }
  let s = Number(hour * 3600) + Number(min * 60) + Number(sec)
  return s
}

/**
 * 秒转时间(hh:mm:ss)
 */
function secToTime(s) {
  if(s < 0)
    return
  let hour = Math.floor(s/3600)
  let min = Math.floor(s/60) % 60
  let sec = s % 60
  let t = ''
  if(hour < 10) {
    t = '0'+ hour + ":"
  } else {
    t = hour + ":"
  }
  if(min < 10){
    t += "0"
  }
  t += min + ":"
  if(sec < 10){
    t += "0"
  }
  t += sec
  return t
}

/**
 *
 *  时间列表(单位秒)
 * onIndex: 当前播放视频的下标
 * onElapsedTime: 当前视频已播放时长
 */
function getDurationList() {
  let onIndex = -1
  let durationList = []
  // durationList = [..., onIndex, onElapsedTime]
  const list = document.querySelector(path.curList).children;
  for(let i = 0; i < list.length; i++) {
    durationList.push(timeToSec(list[i].querySelector(".duration").textContent))
    if (list[i].classList.contains("on"))
      onIndex = i
  }
  durationList.push(onIndex)
  durationList.push(timeToSec(document.querySelector(path.onElapsedTime).textContent))
  return durationList
}


/**
 * 计算剩余时间
 * 与实际有几秒的误差
 * 原因：B站视频选集列表中的时长与实际时长有差
 */
function calRemainingTime() {
  let list = getDurationList()
  let onIndex = list[list.length - 2]
  let onElapsedTime = list[list.length - 1]
  list = list.slice(0,-2)
  let elapsedTime = remainingTime = 0
  for(let i = 0; i < list.length; i++) {
    if(i < onIndex) {
      elapsedTime += list[i]
    } else if(i === onIndex) {
      elapsedTime += onElapsedTime
      remainingTime = list[onIndex] - onElapsedTime
    } else {
      remainingTime += list[i]
    }
  }

  return [secToTime(elapsedTime), secToTime(remainingTime)]
}

/**
 * 添加按钮（新版B站）
 */
function addButtonNew(pNode) {
  let btn = document.createElement("div")
  btn.textContent = "剩余时间"
  btn.classList.add('item')
  btn.classList.add('goback')
  btn.classList.add('xp')
  btn.setAttribute('data-v-19f4a452', '')
  pNode.appendChild(btn)

}

/**
 * 添加按钮（旧版B站）
 */
function addButtonOld(pNode) {
  let btn = document.createElement("div")
  btn.classList.add("float-nav__btn--fixed")
  btn.innerHTML = "<span>剩余</span><span>时间</span>"
  btn.style.cssText="bottom: -6px; width: 45px; height: 45px;"
  pNode.appendChild(btn)
}


/**
 * 提示弹窗
 */
function Toast(msgArr,duration){
  duration=isNaN(duration)?3000:duration;
  var m = document.createElement('div');
  m.innerHTML = msgArr[0] + " | " + msgArr[1];
  console.log(m.innerHTML)
  m.style.cssText="font-size: .32rem;color: rgb(255, 255, 255);background-color: rgba(0, 0, 0, 0.6);padding: 10px 15px;margin: 0 0 0 -60px;border-radius: 4px;position: fixed;    top: 50%;left: 50%;width: 110px;text-align: center; z-index: 100;";
  document.body.appendChild(m);
  console.log(m)
  setTimeout(function() {
      var d = 0.5;
      m.style.opacity = '0';
      setTimeout(function() { document.body.removeChild(m) }, d * 1000);
  }, duration);
}


// 自定义倍速功能
function addRateSelect(rateList) {
  const playbackrateUl = document.querySelector(path.playbackrateUl)
  playbackrateUl.innerHTML = ""
  for(let i = 0; i < rateList.length; i ++) {
    const li = document.createElement("li")
    li.classList.add("bpx-player-ctrl-playbackrate-menu-item")
    li.setAttribute("data-value", rateList[i])
    li.textContent = rateList[i] + "x"
    playbackrateUl.appendChild(li)
  }
}

function getTime() {
  var dateObj = new Date();
  //获取小时
  var hour = dateObj.getHours();
  //获取分钟
  var minute = dateObj.getMinutes();
  //获取秒钟
  var second = dateObj.getSeconds();
  if (hour < 10) {
    hour = "0" + hour;
  }
  if (minute < 10) {
    minute = "0" + minute;
  }
  if (second < 10) {
    second = "0" + second;
  }
  
  return hour + ":" + minute + ":" + second
}

function setTime() {
  const timeNode = document.querySelector(path.showTimePNode).lastChild.firstChild.firstChild
  timeNode.innerHTML = getTime()
}

function toggleTimeNode(flag) {
  // flag为true添加， false删除
  const showTimePNode = document.querySelector(path.showTimePNode)

  if(flag) {
    const div1 = document.createElement("div")
    const div2 = document.createElement("div")
    const span = document.createElement("span")
    div1.classList = ["bpx-player-ctrl-btn bpx-player-ctrl-time"]
    div2.classList.add("bpx-player-ctrl-time-label")
    span.classList.add("bpx-player-ctrl-time-duration")
    div2.appendChild(span)
    div1.appendChild(div2)
    myInterval.timeInterval = setInterval(setTime, 1000)
    showTimePNode.appendChild(div1)
    return 
  }

  const timeNode = showTimePNode.lastChild
  showTimePNode.removeChild(timeNode)
  clearInterval(myInterval.timeInterval)
} 


function showTimeFun() {
  document.addEventListener('fullscreenchange', () => {
    if (document.fullscreenElement) {
      toggleTimeNode(true);
    } else {
      toggleTimeNode(false);
    }
  });
}

function start() {
  addRateSelect(config.rateList)
  if(document.querySelector(path.curList) != null) {
    if(document.querySelector(path.navMenuNew) != null) {
      addButtonNew(document.querySelector(path.navMenuNew))
      document.querySelector(path.remainingTimeNew).addEventListener("click", () => Toast(calRemainingTime()), 1000)
    } else {
      addButtonOld(document.querySelector(path.navMenuOld))
      document.querySelector(path.remainingTimeOld).addEventListener("click", () => Toast(calRemainingTime()), 1000)
    }
  }
  if(config.showTime) {
    showTimeFun()
  }
}

//入口程序
(function() {
  'use strict';

  const video = document.querySelector(path.video)
  function beforeStart() {
    start()
    video.removeEventListener("play",beforeStart)
  }
  video.addEventListener("play", beforeStart)

})()
