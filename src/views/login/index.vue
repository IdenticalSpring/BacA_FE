<template>
  <div class="login-container bgImg content">
    <div class="layout">
      <a-form-model
        :model="loginForm"
        :rules="loginRules"
        class="form-container"
        :wrapper-col="{ span: 22 }"
        ref="loginForm"
      >
        <div class="title">Administrator</div>
        <a-tabs v-model="currentTab" class="tabs" :tabBarGutter="35">
          <a-tab-pane key="user" tab="Login with username and password">
            <a-form-model-item prop="username" v-if="currentTab === 'user'">
              <a-input
                v-model="loginForm.username"
                placeholder="Please enter your account number"
                size="large"
                allow-clear
                @pressEnter="focusPassword"
              >
                <a-icon slot="prefix" type="user" />
              </a-input>
            </a-form-model-item>
            <a-form-model-item prop="password" v-if="currentTab === 'user'">
              <a-input-password
                v-model="loginForm.password"
                placeholder="Please enter your password (Enter any 6 digits)"
                size="large"
                allow-clear
                @pressEnter="toLogin"
                ref="password"
              >
                <svg-icon icon="password" :size="14" slot="prefix"> </svg-icon>
              </a-input-password>
            </a-form-model-item>
          </a-tab-pane>
          <a-tab-pane key="phone" tab="Login by mobile phone number">
            <a-form-model-item prop="phone" v-if="currentTab === 'phone'">
              <a-input
                v-model="loginForm.phone"
                placeholder="Please enter your phone number"
                size="large"
                allow-clear
                :maxLength="11"
                type="text"
              >
                <svg-icon icon="phone" :size="14" slot="prefix"> </svg-icon>
              </a-input>
            </a-form-model-item>

            <a-form-model-item prop="code" v-if="currentTab === 'phone'">
              <a-input
                v-model="loginForm.code"
                placeholder="Please enter the verification code"
                size="large"
                :maxLength="6"
                style="width: 58%"
                ref="code"
                @pressEnter="toLogin"
              >
              </a-input>
              <a-button size="large" @click="getCode" :disabled="codeStatus" style="width: 35%; margin-left: 7%">{{
                phoneCode
              }}</a-button>
            </a-form-model-item>
          </a-tab-pane>
        </a-tabs>

        <a-form-item style="margin-top: -7px">
          <a-button type="primary" block size="large" :loading="loading" @click="toLogin"> Log in </a-button>
        </a-form-item>
        <a-form-item style="margin-top: -7px">
          <a-checkbox v-model="loginForm.remember" v-if="currentTab === 'user'">Remember Password</a-checkbox>
          <span class="forge-password pointer">forget the password</span>
        </a-form-item>
        <a-form-item style="margin-top: -20px">
          <span style="margin-right: 15px">Other login methods</span>
          <svg-icon icon="weixin" :size="25" class="pointer verticalMiddle"></svg-icon>
          <svg-icon icon="qq" :size="25" style="margin: 0 14px" class="pointer verticalMiddle"></svg-icon>
          <svg-icon icon="zhifubao" :size="25" class="pointer verticalMiddle"></svg-icon>
          <span class="forge-password pointer">Register an account</span>
        </a-form-item>
      </a-form-model>
    </div>
  </div>
</template>

<script>
import { isPhone, isPassWord, isCode } from '@/utils/validate';
import { getCache, setCache, removeCache } from '@/utils/session';
import { getPhoneCode } from '@/api/user';
export default {
  name: 'login',
  data() {
    const validateUsername = (rule, value, callback) => {
      if (value.trim().length === 0) {
        callback(new Error('Username cannot be empty'));
      } else {
        callback();
      }
    };
    const validatePassword = (rule, value, callback) => {
      if (!isPassWord(value)) {
        callback(new Error('Please enter the password correctly'));
      } else {
        callback();
      }
    };
    const validatePhone = (rule, value, callback) => {
      if (!isPhone(value)) {
        callback(new Error('The mobile phone number is incorrect, please fill in again'));
      } else {
        callback();
      }
    };
    const validateCode = (rule, value, callback) => {
      if (!isCode(value)) {
        callback(new Error('The verification code is incorrect, please fill it in again'));
      } else {
        callback();
      }
    };

    return {
      currentTab: 'user',
      loginForm: {
        username: '',
        password: '',
        phone: '',
        code: '',
        remember: true
      },
      loginRules: {
        username: [{ required: true, trigger: 'blur', validator: validateUsername }],
        password: [{ required: true, trigger: 'blur', validator: validatePassword }],
        phone: [{ required: true, trigger: 'blur', validator: validatePhone }],
        code: [{ required: true, trigger: 'blur', validator: validateCode }]
      },
      loading: false,
      phoneCode: 'Get verification code',
      codeStatus: false,
      currentCode: null
    };
  },
  mounted() {
    const cache = getCache('LOGIN_INFO');
    if (cache) {
      this.loginForm.username = cache.username;
      this.loginForm.password = cache.password;
    }
  },
  methods: {
    focusPassword() {
      this.$refs.password.focus();
    },
    //获取验证码
    getCode() {
      if (isPhone(this.loginForm.phone)) {
        this.codeStatus = true;
        let time = 60;
        var getPhoneIntval = setInterval(() => {
          if (time > 0) {
            time--;
            this.phoneCode = `Re-acquisition(${time}s)`;
          } else {
            clearInterval(getPhoneIntval);
            getPhoneIntval = null;
            this.phoneCode = 'Get verification code';
            this.codeStatus = false;
          }
        }, 1000);

        this.$refs.code.focus();
        getPhoneCode().then(res => {
          this.currentCode = res.data;
          setTimeout(() => {
            this.$notification.success(
              {
                message: 'hint',
                description: 'The verification code was obtained successfully. Your verification code is:' + res.data
              },
              12
            );
          }, 1000);
        });
      } else {
        this.$message.error('Please enter your phone number correctly');
      }
    },
    //登录
    toLogin() {
      this.$refs.loginForm.validate(valid => {
        if (valid) {
          this.loading = true;
          if (this.currentTab === 'user') {
            const { username, password } = this.loginForm;
            this.$store
              .dispatch('user/login', { username, password })
              .then(() => {
                if (this.loginForm.remember) {
                  setCache('LOGIN_INFO', { username, password });

                  this.$router.push({
                    path: '/index'
                  });
                  this.loading = false;
                } else {
                  removeCache('LOGIN_INFO');
                }
              })
              .catch(() => {
                setTimeout(() => {
                  this.loading = false;
                }, 500);
              });
          } else if (this.currentTab === 'phone') {
            const { phone, code } = this.loginForm;
            this.$store
              .dispatch('user/codeTest', { phone, code })
              .then(() => {
                removeCache('LOGIN_INFO');
                this.$router.push({
                  path: '/index'
                });
                this.loading = false;
              })
              .catch(() => {
                setTimeout(() => {
                  this.loading = false;
                }, 500);
              });
          }
        } else {
          return false;
        }
      });
    }
  }
};
</script>
<!-- <script>
import { login } from '@/api/user';
export default {
  name: 'login',
  data() {
    return {
      currentTab: 'user',
      loginForm: {
        username: '',
        password: ''
      },
      loginRules: {
        username: [{ required: true, message: 'Username cannot be empty', trigger: 'blur' }],
        password: [{ required: true, message: 'Password cannot be empty', trigger: 'blur' }]
      },
      loading: false
    };
  },
  methods: {
    focusPassword() {
      this.$refs.password.focus();
    },
    async toLogin() {
      this.$refs.loginForm.validate(async valid => {
        if (valid) {
          this.loading = true;
          try {
            const response = await login(this.loginForm.username, this.loginForm.password);
            this.$message.success('Login successful');
            localStorage.setItem('token', response.token);
            this.$router.push('/');
          } catch (error) {
            this.$message.error(error.message || 'Login failed');
          } finally {
            this.loading = false;
          }
        }
      });
    }
  }
};
</script> -->
<style lang="scss" scoped>
.login-container {
  background-image: url('~@/assets/login/background.jpg');
  height: 100%;
  .layout {
    width: 55%;
    min-width: 900px;
    margin: 0 auto;
    .form-container {
      width: 400px;
      height: 550px;
      margin: 0 auto;
      margin-right: 0;
      padding-top: 55%;
      transform: translateY(-50%);
      .title {
        font-weight: 700;
        font-size: 1.8rem;
        padding-left: 5px;
      }
      .tabs {
        margin: 15px 0;
      }
      .forge-password {
        font-size: 14px;
        float: right;
        color: #1890ff;
      }
    }
  }
}
</style>
<style lang="scss">
.login-container {
  .ant-tabs-bar {
    border-bottom: none !important;
  }
  .ant-input-affix-wrapper .ant-input:not(:first-child) {
    padding-left: 35px !important;
  }
  .ant-tabs-bar {
    margin-bottom: 30px !important;
  }
}
</style>
