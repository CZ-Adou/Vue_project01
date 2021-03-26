<template>
  <div>
    <el-calendar v-model="value"> </el-calendar>
  </div>
</template>

<script>
export default {
  data () {
    return { value: new Date() }
  },
  methods: {},
  computed: {}
}
</script>

<style scoped>
</style>
