<template>
  <div class="lottery-container">
    <a-row class="marginBottom" :gutter="16">
      <a-col :xs="24" :md="24" :sm="24" :lg="24" :xl="12">
        <a-card title="Big Wheel Draw" :hoverable="true" :bordered="false">
          <circular />
        </a-card>
      </a-col>
      <a-col :xs="24" :md="24" :sm="24" :lg="24" :xl="12">
        <a-card title="Nine-square lucky draw" :hoverable="true" :bordered="false">
          <nine-lucky />
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script>
import circular from './components/circular';
import nineLucky from './components/nineLucky';
export default {
  name: 'lottery',
  components: { circular, nineLucky },
  data() {
    return {};
  }
};
</script>
<style lang="scss" scoped>
.lottery-container {
  width: 100%;
  .marginBottom {
    margin-bottom: 25px;
  }
}
</style>
