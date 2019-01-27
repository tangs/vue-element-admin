<template>
  <div class="createPost-container">
    <el-form ref="postForm" :model="postForm" :rules="rules" class="form-container">

      <sticky :class-name="'sub-navbar '+postForm.status">
        <el-button v-loading="loading" style="margin-left: 10px;" type="success" @click="query">{{ $t('funcMask.query') }}
        </el-button>
        <el-button v-loading="loading" style="margin-left: 10px;" type="success" @click="publish">{{ $t('funcMask.publish') }}
        </el-button>
      </sticky>

      <div class="createPost-main-container">
        <el-row style="margin-top: 32px;">
          <el-col :span="24">
            <div class="postInfo-container">
              <el-row>
                <el-col :span="6">
                  <el-form-item :label="$t('funcMask.version')" label-width="60px" class="article-textarea" prop="version">
                    <el-input :rows="1" v-model="postForm.version" placeholder="请输入内容"/>
                  </el-form-item>
                </el-col>
                <el-col :span="15" style="margin-left: 32px;">
                  <el-form-item :label="$t('funcMask.channels')" label-width="65px" class="article-textarea" prop="channels">
                    <el-input :rows="1" v-model="postForm.channels" placeholder="请输入内容"/>
                  </el-form-item>
                </el-col>
              </el-row>
            </div>
          </el-col>
        </el-row>
        <el-row>
          <el-checkbox :label="$t('funcMask.pay')" v-model="postForm.paySelected"/>
          <!-- <el-form-item :label="$t('funcMask.pay')"/> -->
          <el-checkbox-group v-model="postForm.pay" style="margin-left: 32px;">
            <el-checkbox label="H5支付宝"/>
            <el-checkbox label="H5微信"/>
            <el-checkbox label="微信APP"/>
            <el-checkbox label="苹果支付"/>
          </el-checkbox-group>
        </el-row>
        <el-row>
          <!-- <el-form-item :label="$t('funcMask.hall')"/> -->
          <el-checkbox :label="$t('funcMask.hall')" v-model="postForm.hallSelected"/>
          <el-checkbox-group v-model="postForm.hall" style="margin-left: 32px;">
            <el-checkbox label="大风车"/>
            <el-checkbox label="经典水果机"/>
            <el-checkbox label="金鲨银鲨"/>
            <el-checkbox label="奔驰宝马"/>
            <el-checkbox label="扎金花"/>
            <el-checkbox label="百人牛牛"/>
            <el-checkbox label="客服"/>
            <el-checkbox label="奖励"/>
            <el-checkbox label="抽奖"/>
            <el-checkbox label="VIP "/>
            <el-checkbox label="商店"/>
            <el-checkbox label="活动"/>
          </el-checkbox-group>
        </el-row>
        <el-form-item :label="$t('funcMask.log')" prop="log">
          <el-input v-model="postForm.log" rows="6" type="textarea" class="article-textarea" resize clearable placeholder=""/>
        </el-form-item>
      </div>
    </el-form>
  </div>
</template>

<script>
import Tinymce from '@/components/Tinymce'
import MDinput from '@/components/MDinput'
import Sticky from '@/components/Sticky' // 粘性header组件
import { fetchArticle } from '@/api/article'
import axios from 'axios'
import cookie from 'js-cookie'

const defaultForm = {
  log: '',
  version: '',
  channels: '',
  status: 'draft',
  paySelected: false,
  hallSelected: false,
  pay: [],
  hall: [],
  platforms: ['a-platform'],
  comment_disabled: false,
  importance: 0
}

const payMap = {
  commwappayalipay: 'H5支付宝',
  commwappayweixin: 'H5微信',
  wechatpp: '微信APP',
  appstore: '苹果支付'
}

export default {
  name: 'ArticleDetail',
  components: { Tinymce, MDinput, Sticky },
  props: {
    isEdit: {
      type: Boolean,
      default: false
    }
  },
  data() {
    const validateRequire = (rule, value, callback) => {
      if (value === '') {
        this.$message({
          message: rule.field + '为必传项',
          type: 'error'
        })
        callback(new Error(rule.field + '为必传项'))
      } else {
        callback()
      }
    }
    return {
      postForm: Object.assign({}, defaultForm),
      loading: false,
      userListOptions: [],
      rules: {
        version: [{ validator: validateRequire }],
        channels: [{ validator: validateRequire }]
      },
      tempRoute: {}
    }
  },
  computed: {
    lang() {
      return this.$store.getters.language
    }
  },
  created() {
    if (this.isEdit) {
      const id = this.$route.params && this.$route.params.id
      this.fetchData(id)
    } else {
      this.postForm = Object.assign({}, defaultForm)
    }

    // Why need to make a copy of this.$route here?
    // Because if you enter this page and quickly switch tag, may be in the execution of the setTagsViewTitle function, this.$route is no longer pointing to the current page
    // https://github.com/PanJiaChen/vue-element-admin/issues/1221
    this.tempRoute = Object.assign({}, this.$route)
  },
  methods: {
    fetchData(id) {
      fetchArticle(id).then(response => {
        this.postForm = response.data
        // Just for test
        this.postForm.title += `   Article Id:${this.postForm.id}`
        this.postForm.content += `   Article Id:${this.postForm.id}`
      }).catch(err => {
        console.log(err)
      })
    },
    appendLog(txt) {
      this.postForm.log += txt + '\n'
    },
    getPayName(type) {
      return payMap[type]
    },
    getPayType(name) {
      const keys = Object.keys(payMap)
      for (let i = 0; i < keys.length; ++i) {
        const key = keys[i]
        if (payMap[key] === name) {
          return key
        }
      }
    },
    updatePayInfo(payInfos) {
      const masks = payInfos.split(':')
      const payMask = []
      for (let i = 0; i < masks.length; ++i) {
        const name = this.getPayName(masks[i])
        payMask.push(name)
      }
      this.postForm.pay = payMask
    },
    notifySucc(txt) {
      this.$notify({
        title: '成功',
        message: 'succ:' + txt,
        type: 'succ',
        duration: 4000
      })
    },
    notifyErr(error) {
      this.$notify({
        title: '失败',
        message: 'err:' + error,
        type: 'fail',
        duration: 4000
      })
    },
    query() {
      console.dir(this.postForm)
      this.postForm.status = 'draft'
      this.$refs.postForm.validate(valid => {
        if (valid) {
          this.loading = true
          // console.log('v:' + this.postForm.version)
          // console.log('c:' + this.postForm.channels)
          const url = `http://120.132.50.206:8585/function.php?version=${this.postForm.version}&channel=${this.postForm.channels}`
          console.log('url:' + url)
          axios.get(url).then((res) => {
            this.notifySucc('')
            const data = res.data
            const paramStr = data.param
            console.log(data)
            if (data.result === 'true') {
              this.appendLog(paramStr)
              const params = JSON.parse(paramStr)
              for (let i = 0; i < params.length; ++i) {
                const param = params[i]
                if (param.type === 'pay') {
                  this.updatePayInfo(param.value)
                }
              }
              this.postForm.status = 'published'
            } else {
              this.notifyErr(paramStr)
            }
          }).catch((error) => {
            this.notifyErr(error)
          })
          this.loading = false
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    publish() {
      console.dir(this.postForm)
      this.postForm.status = 'draft'
      this.$refs.postForm.validate(valid => {
        if (valid) {
          this.loading = true
          const postData1 = {
            username: 'admin',
            token: cookie.get('server_token_key'),
            version: this.postForm.version,
            channel: this.postForm.channels,
            type: 'pay',
            value: ''
          }
          const paySelects = this.postForm.pay
          for (let i = 0; i < paySelects.length; ++i) {
            if (i > 0) {
              postData1.value += ':'
            }
            postData1.value += this.getPayType(paySelects[i])
          }
          // console.dir(postData)
          const postData = `username=${postData1.username}&token=${postData1.token}&version=${postData1.version}&channel=${postData1.channel}&type=${postData1.type}&value=${postData1.value}`
          console.log(postData)
          const url = 'http://120.132.50.206:8585/function.php'
          axios.post(
            url,
            postData
          ).then((res) => {
            this.notifySucc('')
            const data = res.data
            const paramStr = data.param
            console.log(data)
            if (data.result === 'true') {
              this.appendLog(paramStr)
              // const params = JSON.parse(paramStr)
              // for (let i = 0; i < params.length; ++i) {
              //   const param = params[i]
              //   if (param.type === 'pay') {
              //     this.updatePayInfo(param.value)
              //   }
              // }
              this.postForm.status = 'published'
            } else {
              this.notifyErr(paramStr)
            }
          }).catch((error) => {
            this.notifyErr(error)
          })
          this.loading = false
        } else {
          console.log('error submit!!')
          return false
        }
      })
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
@import "~@/styles/mixin.scss";
.createPost-container {
  position: relative;
  .createPost-main-container {
    padding: 40px 45px 20px 50px;
    .postInfo-container {
      position: relative;
      @include clearfix;
      margin-bottom: 10px;
      .postInfo-container-item {
        float: left;
      }
    }
  }
  .word-counter {
    width: 40px;
    position: absolute;
    right: -10px;
    top: 0px;
  }
}
</style>
