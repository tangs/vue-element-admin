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
        <el-row>
          <el-col :span="24">
            <div class="postInfo-container">
              <el-row>
                <el-col :span="4">
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
        <el-form-item style="margin-bottom: 40px;" prop="title">
          <MDinput v-model="postForm.title" :maxlength="100" name="name" required>
            {{ $t('mail.title') }}
          </MDinput>
        </el-form-item>
        <el-form-item :label="$t('funcMask.log')" label-width="60px" prop="log">
          <el-input v-model="postForm.log" rows="8" type="textarea" class="article-textarea" resize clearable placeholder=""/>
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

const defaultForm = {
  log: '',
  version: '',
  channels: '',
  status: 'draft',
  platforms: ['a-platform'],
  comment_disabled: false,
  importance: 0
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
          console.log('v:' + this.postForm.version)
          console.log('c:' + this.postForm.channels)
          const url = `http://120.132.50.206:8585/function.php?version=${this.postForm.version}&channel=${this.postForm.channels}`
          console.log('url:' + url)
          axios.get(url).then((res) => {
            this.notifySucc('')
            console.log(res.data)
            if (res.data.result === 'true') {
              this.appendLog(res.data.param)
              this.postForm.status = 'published'
            } else {
              this.notifyErr(res.data.param)
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
