<template>
  <div class="table-wrapper">
    <a-card :hoverable="true" :bordered="false">
      <div slot="title" class="flex flex-wrap">
        <a-button
          type="danger"
          icon="delete"
          style="margin: 0 16px 10px"
          :loading="deleteLoading"
          @click="batchDeleteTable"
        >
          Batch Deletion
        </a-button>
        <div class="filter-wrapper">
          <span class="label">Payee:</span>
          <a-input placeholder="Payer" class="select-width" v-model="filterList.name" />
        </div>
        <div class="filter-wrapper" style="margin: 0 15px">
          <span class="label">Order Status:</span>
          <a-select placeholder="Order Status" class="select-width" allowClear @change="changeStatus">
            <a-select-option v-for="item in typeOption" :key="item.key" :value="item.key">
              {{ item.label }}
            </a-select-option>
          </a-select>
        </div>

        <a-button type="primary" icon="search" class="select-bottom" style="margin-right: 16px" @click="search">
          Query
        </a-button>
        <a-button type="primary" icon="export" class="select-bottom" :loading="exportLoading" @click="handleExport">
          Export
        </a-button>
      </div>

      <standard-table
        :tableData="tableData"
        :tableHead="tableHead"
        :loading="loading"
        :pagination="{
          pageSize: filterList.size,
          current: filterList.page,
          total: filterList.total,
          showTotal: total => `${filterList.total} strip`
        }"
        :rowSelection="{ selectedRowKeys: selectedRowKeys, onChange: handleSelect }"
        @changeCurrent="handleChangeCurrent"
      >
        <div slot="index" slot-scope="{ index }">
          {{ index + 1 }}
        </div>
        <div slot="money" slot-scope="{ text }">¥ {{ text }}</div>
        <div slot="action" slot-scope="{ text }">
          <a-button type="primary" size="small" @click="handleEdit(text)"> 编辑 </a-button>
          <a-popconfirm
            title="Are you sure you want to delete the current column?"
            ok-text="yes"
            cancel-text="no"
            @confirm="handleDelete(text)"
          >
            <a-button type="danger" size="small" style="margin-left: 8px"> 删除 </a-button>
          </a-popconfirm>
        </div>
      </standard-table>
    </a-card>

    <a-modal
      title="edit"
      :visible="editShow"
      okText="confirm"
      cancelText="Cancel"
      :width="620"
      @ok="handleOk"
      @cancel="editShow = false"
    >
      <a-form-model :label-col="{ span: 4 }" :wrapper-col="{ span: 16 }" hideRequiredMark>
        <a-form-model-item prop="id" label="id">
          <a-input v-model="currentEdit.id" disabled />
        </a-form-model-item>
        <a-form-model-item prop="name" label="Payer">
          <a-input v-model="currentEdit.name" disabled />
        </a-form-model-item>
        <a-form-model-item prop="status" label="Order Status">
          <a-input v-model="currentEdit.status" disabled />
        </a-form-model-item>
        <a-form-model-item prop="date" label="Order time">
          <a-input v-model="currentEdit.date" disabled />
        </a-form-model-item>
        <a-form-model-item prop="money" label="Payment Amount">
          <a-input v-model="currentEdit.money" disabled />
        </a-form-model-item>
        <a-form-model-item prop="text" label="Remark">
          <a-input v-model="currentEdit.text" />
        </a-form-model-item>
      </a-form-model>
    </a-modal>
  </div>
</template>

<script>
import standardTable from '@/components/standardTable/index';
import { getTableData, deleteTable, batchDeleteTable, editTable } from '@/api/table';
import { formatJson } from '@/utils';
export default {
  name: 'tables',
  components: { standardTable },

  data() {
    return {
      typeOption: [
        {
          key: '待付款',
          label: 'Payment pending'
        },
        {
          key: '待发货',
          label: 'Waiting for delivery'
        },
        {
          key: '已发货',
          label: 'Shipped'
        },
        {
          key: '已收货',
          label: 'Received'
        },
        {
          key: '已评价',
          label: 'Rated'
        }
      ],
      tableHead: [
        {
          title: 'Seri',
          dataIndex: 'index',
          scopedSlots: { customRender: 'index' },
          width: 60
        },
        {
          title: 'User ID',
          dataIndex: 'id',
          ellipsis: true
        },
        {
          title: 'Payer',
          dataIndex: 'name'
        },
        {
          title: 'Order Status',
          dataIndex: 'status'
        },
        {
          title: 'Order time',
          dataIndex: 'date',
          ellipsis: true
        },
        {
          title: 'Payment Amount',
          dataIndex: 'money',
          scopedSlots: { customRender: 'money' }
        },
        {
          title: 'Remark',
          dataIndex: 'text',
          ellipsis: true
        },
        {
          title: 'operate',
          scopedSlots: { customRender: 'action' },
          width: 140
        }
      ],
      tableData: [],
      loading: false,
      selectedRowKeys: [],
      selectValue: [],
      currentEdit: {},
      editShow: false,
      filterList: {
        name: '',
        status: '',
        page: 1,
        size: 15,
        total: 0
      },
      deleteLoading: false,
      exportLoading: false
    };
  },
  mounted() {
    this.getTableData();
  },
  methods: {
    handleSelect(key, value) {
      this.selectedRowKeys = key;
      this.selectValue = value;
    },

    getTableData() {
      this.loading = true;
      const { name, status, page, size } = this.filterList;
      getTableData({ page, size, name, status }).then(res => {
        const data = res.data || {};
        this.filterList.total = data.total || 0;
        this.tableData = data.list || [];
        this.loading = false;
      });
    },

    changeStatus(val) {
      this.filterList.status = val;
    },

    handleChangeCurrent(val) {
      this.filterList.page = val;
      this.getTableData();
    },

    search() {
      this.filterList.page = 1;
      this.getTableData();
    },

    handleEdit(val) {
      this.currentEdit = { ...val };
      this.editShow = true;
    },

    handleDelete(val) {
      const { id } = val;
      deleteTable({ id }).then(res => {
        this.getTableData();
        this.$message.success('删除成功');
      });
    },

    batchDeleteTable() {
      //模拟删除
      if (this.selectValue.length == 0) {
        this.$message.warning('请至少勾选一项');
        return;
      }
      this.deleteLoading = true;
      const batchId = this.selectValue.map(item => item.id).join(',');
      batchDeleteTable({ batchId }).then(res => {
        this.getTableData();
        this.$message.success('批量删除成功');
        this.deleteLoading = false;
      });
    },

    handleOk() {
      const { id, text } = this.currentEdit;
      editTable({ id, text }).then(res => {
        this.$message.success('修改成功！');
        this.editShow = false;
        this.getTableData();
      });
    },

    //导出
    handleExport() {
      //由于是前端导出，所以只能导出当前的页的15条数据
      this.exportLoading = true;
      import('@/vendor/Export2Excel').then(excel => {
        const header = [],
          filterVal = [];
        this.tableHead.forEach(item => {
          if (item.title != '操作' && item.title != '序号') {
            header.push(item.title);
            filterVal.push(item.dataIndex);
          }
        });
        const data = formatJson(this.tableData, filterVal);

        excel.export_json_to_excel({
          header,
          data,
          filename: '表单统计'
        });
        this.exportLoading = false;
      });
    }
  }
};
</script>
<style lang="scss" scoped>
.table-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
  .filter-wrapper {
    width: 230px;
    .label {
      min-width: 80px;
    }
    .select-width {
      width: 150px;
    }
  }
}
</style>
