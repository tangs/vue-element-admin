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
          <el-checkbox-group v-model="postForm.pay" style="margin-left: 32px;">
            <el-checkbox v-for="pay in payNames" :label="pay.v" :key="pay.k" style="width: 250px">{{ pay.v }}[{{ pay.k }}]</el-checkbox>
          </el-checkbox-group>
        </el-row>
        <el-row>
          <el-checkbox :label="$t('funcMask.hall')" v-model="postForm.hallSelected"/>
          <div class="checkbox-group" style="margin-left: 32px;">
            <el-checkbox-group v-model="postForm.hall">
              <el-checkbox v-for="funcName in hallNames" :label="funcName" :key="funcName" style="width: 150px">{{ funcName }}</el-checkbox>
            </el-checkbox-group>
          </div>
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
  paySelected: true,
  hallSelected: true,
  pay: [],
  hall: [],
  platforms: ['a-platform'],
  comment_disabled: false,
  importance: 0
}

const payMap = {
  commwappayalipay: 'H5支付宝',
  commwappayweixin: 'H5微信',
  commwappayunionpay: 'H5银联',
  wechat: '微信',
  wechatpp: '微信APP',
  appstore: '苹果支付',
  samsung: '三星',
  xiaomi: '小米',
  ysdk: 'ysdk',
  vivo: 'vivo',
  jinli: '金立',
  huawei: '华为',
  uc: 'uc',
  jolo: 'jolo',
  ptpay: 'ptpay',
  baidu_new: '百度(新)',
  anzhi: 'anzhi',
  niux: 'niux',
  letv: '乐视',
  360: '360',
  baidu: '百度'
}

const hallMap = {
  '<1': '大风车',
  '<2': '经典水果机',
  '<3': '金鲨银鲨',
  '<4': '奔驰宝马',
  '<6': '扎金花',
  '<7': '百人牛牛',
  '<8': '客服 ',
  '<9': '奖励',
  '<10': '抽奖',
  '<11': '摇钱树',
  '<12': 'VIP',
  '<14': '商店',
  '<15': '活动',
  '<16': '排行',
  '<17': '更多',
  '<18': '邮件',
  '<19': '绑定手机',
  '<24': '黄金矿工',
  '<26': '聊天',
  '<27': '快速开始',
  '<28': '下载',
  '<29': '评论',
  '<30': '快速支付',
  '<32': '捕鱼',
  '<33': '拉霸',
  '<34': '钻石购买',
  '<36': '特殊捕鱼-更多',
  '<37': '特殊捕鱼-普通大厅',
  '<38': '特殊捕鱼-弹出礼包',
  '<39': '扎金花-贵宾厅',
  '<40': '星座场',
  '<41': '气球场'
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
    const payNames = []
    let keys = Object.keys(payMap)
    for (let i = 0; i < keys.length; ++i) {
      const key = keys[i]
      payNames.push({
        k: key,
        v: payMap[key]
      })
    }
    const hallNames = []
    keys = Object.keys(hallMap)
    for (let i = 0; i < keys.length; ++i) {
      const key = keys[i]
      hallNames.push(hallMap[key])
    }
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
      payNames: payNames,
      hallNames: hallNames,
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
    getKeyByValue(map, value) {
      const keys = Object.keys(map)
      for (let i = 0; i < keys.length; ++i) {
        const key = keys[i]
        if (map[key] === value) {
          return key
        }
      }
    },
    getPayName(type) {
      return payMap[type]
    },
    getPayType(name) {
      // const idx = name.indexOf('[')
      // if (idx !== -1) {
      //   name = name.substr(0, idx)
      // }
      return this.getKeyByValue(payMap, name)
    },
    getHallName(type) {
      return hallMap[type]
    },
    getHallType(name) {
      return this.getKeyByValue(hallMap, name)
    },
    getMasks(infos, func) {
      const masks = infos.split(':')
      const maskArr = []
      for (let i = 0; i < masks.length; ++i) {
        const name = func(masks[i])
        maskArr.push(name)
      }
      return maskArr
    },
    updatePayInfo(payInfos) {
      this.postForm.pay = this.getMasks(payInfos, this.getPayName)
    },
    updteHallInfo(hallInfos) {
      this.postForm.hall = this.getMasks(hallInfos, this.getHallName)
    },
    clearPayInfo() {
      this.postForm.pay = []
    },
    clearHallInfo() {
      this.postForm.hall = []
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
    publishData(postData1) {
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
          const data = postData1
          data.username = undefined
          data.token = undefined
          this.appendLog('publish:' + JSON.stringify(data))
          this.postForm.status = 'published'
        } else {
          this.notifyErr(paramStr)
        }
        this.loading = false
      }).catch((error) => {
        this.notifyErr(error)
        this.loading = false
      })
    },
    query() {
      console.dir(this.postForm)
      this.postForm.status = 'draft'
      this.$refs.postForm.validate(valid => {
        if (valid) {
          this.loading = true
          const url = `http://120.132.50.206:8585/function.php?version=${this.postForm.version}&channel=${this.postForm.channels}`
          console.log('url:' + url)
          axios.get(url).then((res) => {
            this.notifySucc('')
            const data = res.data
            const paramStr = data.param
            console.log(data)
            if (data.result === 'true') {
              this.appendLog('query:' + paramStr)
              const params = JSON.parse(paramStr)
              this.clearPayInfo()
              this.clearHallInfo()
              for (let i = 0; i < params.length; ++i) {
                const param = params[i]
                if (param.type === 'pay') {
                  this.updatePayInfo(param.value)
                } else if (param.type === 'hall') {
                  this.updteHallInfo(param.value)
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
      this.$refs.postForm.validate(valid => {
        if (valid) {
          const postData1 = {
            username: 'admin',
            token: cookie.get('server_token_key'),
            version: this.postForm.version,
            channel: this.postForm.channels,
            type: '',
            value: ''
          }
          const getValues = (selects, func) => {
            let value = ''
            let isFirst = true
            for (let i = 0; i < selects.length; ++i) {
              const type = func(selects[i])
              if (type == null) {
                continue
              }
              if (isFirst) {
                isFirst = false
              } else {
                value += ':'
              }
              value += type
            }
            return value
          }
          if (this.postForm.paySelected) {
            postData1.value = getValues(this.postForm.pay, this.getPayType)
            postData1.type = 'pay'
            this.publishData(postData1)
            this.loading = true
          }
          if (this.postForm.hallSelected) {
            postData1.value = getValues(this.postForm.hall, this.getHallType)
            postData1.type = 'hall'
            this.publishData(postData1)
            this.loading = true
          }
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
.el-checkbox+.el-checkbox {
margin-left: 0px;
}
.el-checkbox {
margin-right: 25px;
}
</style>
