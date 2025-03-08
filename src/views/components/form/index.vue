<template>
  <div class="form-container">
    <a-card :hoverable="true" :bordered="false">
      <a-form-model :model="form" :rules="formRule" :label-col="{ span: 6 }" :wrapper-col="{ span: 14 }" ref="form">
        <a-form-model-item prop="name" label="Product Name" hasFeedback>
          <a-input v-model="form.name" />
        </a-form-model-item>
        <a-form-model-item prop="type" label="Product Type" hasFeedback>
          <a-select placeholder="Please enter the product type" allowClear @change="changeType">
            <a-select-option v-for="item in typeOption" :key="item.key" :value="item.key">
              {{ item.label }}
            </a-select-option>
          </a-select>
        </a-form-model-item>
        <a-form-model-item prop="weight" label="weight" hasFeedback>
          <a-input v-model="form.weight" placeholder="Please enter weight（kg）" />
        </a-form-model-item>
        <a-form-model-item prop="weight" label="price" hasFeedback>
          <a-input v-model="form.price" />
        </a-form-model-item>
        <a-form-model-item prop="date" label="Release Date" hasFeedback>
          <a-range-picker :placeholder="['start date', 'End Date']" allowClear @change="changTime" />
        </a-form-model-item>
        <a-form-model-item label="Is it pinned?" prop="recommend">
          <a-switch v-model="form.topping" />
        </a-form-model-item>
        <a-form-model-item prop="text" label="Product Description">
          <a-textarea
            v-model="form.text"
            placeholder="Please enter a product description"
            :autoSize="{ minRows: 3, maxRows: 5 }"
          />
        </a-form-model-item>
        <a-form-model-item prop="reviewer" label="Reviewer">
          <a-radio-group v-model="form.reviewer">
            <a-radio value="Siri"> Siri </a-radio>
            <a-radio value="Timi"> Timi </a-radio>
          </a-radio-group>
        </a-form-model-item>
        <a-form-model-item :wrapper-col="{ span: 24 }" class="text-center">
          <a-button type="primary" @click="addFormData"> Add to </a-button>
          <a-button style="margin-left: 10px" @click="resetFrom"> Cancel </a-button>
        </a-form-model-item>
      </a-form-model>
    </a-card>
  </div>
</template>

<script>
import moment from 'moment';
import 'moment/locale/zh-cn';
moment.locale('zh-cn');
export default {
  name: 'formPgae',
  data() {
    return {
      formRule: {
        name: [{ required: true, trigger: 'blur', message: 'Product name cannot be empty!' }],
        type: [{ required: true, trigger: 'blur', message: 'Product type cannot be empty!' }],
        weight: [{ required: true, trigger: 'blur', message: 'Product weight cannot be empty!' }],
        date: [{ required: true, trigger: 'blur', message: 'Time cannot be empty!' }]
      },
      typeOption: [
        {
          key: 'clothes',
          label: 'clothes'
        },
        {
          key: 'shoes',
          label: 'shoes'
        },
        {
          key: 'snacks',
          label: 'snacks'
        },
        {
          key: 'sport',
          label: 'sport'
        },
        {
          key: 'fruits',
          label: 'fruits'
        },
        {
          key: 'frequently',
          label: 'frequently'
        },
        {
          key: 'other',
          label: 'other'
        }
      ],
      form: {
        name: '',
        type: '',
        weight: '',
        price: '',
        topping: false,
        text: '',
        date: [],
        reviewer: 'Siri'
      }
    };
  },
  mounted() {},
  methods: {
    changeType(val) {
      this.form.type = val;
    },
    changTime(val, str) {
      this.form.date = str;
    },
    addFormData() {
      this.$refs.form.validate(valid => {
        if (valid) {
          this.$message.success('Simulate adding successfully');
        }
      });
    },
    resetFrom() {
      this.$refs.form.resetFields();
    }
  }
};
</script>
<style lang="scss" scoped>
.form-container {
  width: 100%;
}
</style>
