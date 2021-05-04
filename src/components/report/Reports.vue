<template>
<div>
  <!-- 为ECharts准备一个具备大小（宽高）的Dom -->
    <div id="main" style="width: 80%;height:400px; margin: 0 auto"></div>
</div>
</template>
<script>
import * as echarts from 'echarts'
export default {
  data () {
    return {

    }
  },
  async mounted () {
    // 基于准备好的dom，初始化echarts实例
    var myChart = echarts.init(document.getElementById('main'))

    // 指定图表的配置项和数据
    var option = {
      title: {
        text: '用户来源'
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          label: {
            backgroundColor: '#E9EEF3'
          }
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: [
        {
          boundaryGap: false
        }
      ],
      yAxis: [
        {
          type: 'value'
        }
      ]
    }

    const { data: res } = await this.$http.get('reports/type/1')
    console.log(res)
    option = { ...option, ...res.data }
    // 使用刚指定的配置项和数据显示图表。
    myChart.setOption(option)
  },
  methods: {

  },
  computed: {

  }
}
</script>
<style lang='less' scoped>

</style>
