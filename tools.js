// 获取当前时间 hh:mm:ss
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