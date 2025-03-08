<template>
  <a-card title="html2canvas" :hoverable="true" :bordered="false">
    <a-button type="primary" slot="extra" icon="download" :loading="loading" @click="handleScreen">
      Download screenshots
    </a-button>
    <div style="height: 500px" class="flex" ref="cutScreen">
      <div style="width: 50%; height: 100%">
        <more-bar class="all-container" />
      </div>
      <div style="width: 50%; height: 100%" class="all-container">
        <radius-pie class="all-container" />
      </div>
    </div>
  </a-card>
</template>
<script>
import moreBar from '@/views/echarts/bar/components/moreBar';
import radiusPie from '@/views/echarts/pie/components/radiusPie';
import remoteLoad from '@/utils/remoteLoad';
const { html2canvasCDN } = require('@/plugins/cdn');
export default {
  components: { moreBar, radiusPie },
  data() {
    return {
      loading: false
    };
  },
  mounted() {
    this.init();
  },
  methods: {
    async init() {
      try {
        await remoteLoad(html2canvasCDN);
        if (!window.html2canvas) {
          this.$message.error('Failed to load resource');
        }
      } catch (error) {
        console.log(error);
        this.$message.error(error);
      }
    },
    handleScreen() {
      this.loading = true;
      const boxDom = this.$refs.cutScreen;

      window.html2canvas(boxDom).then(res => {
        var dataUrl = res.toDataURL('image/jpeg', 1.0);
        var a = document.createElement('a');
        a.href = dataUrl;
        a.download = 'htmlcanvas2.png';
        a.click();
        this.loading = false;
      });
    }
  }
};
</script>
