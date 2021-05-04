import Vue from 'vue'

Vue.filter('dateFormat', function (time) {
  const dt = new Date(time)
  const y = (dt.getFullYear()).toString().padStart(2, '0')
  const m = (dt.getMonth() + 1).toString().padStart(2, '0')
  const d = (dt.getDate()).toString().padStart(2, '0')
  const hh = (dt.getUTCHours()).toString().padStart(2, '0')
  const mm = (dt.getMinutes()).toString().padStart(2, '0')
  const ss = (dt.getSeconds()).toString().padStart(2, '0')
  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})
