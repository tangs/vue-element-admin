<template>
  <div class="createPost-container">
    <el-form ref="postForm" :model="postForm" :rules="rules" class="form-container">

      <sticky :class-name="'sub-navbar '+postForm.status">
        <el-button v-loading="loading" style="margin-left: 10px;" type="success" @click="submitForm">{{ $t('mail.send') }}
        </el-button>
      </sticky>

      <div class="createPost-main-container">
        <el-row>
          <el-col :span="24">
            <div class="postInfo-container">
              <el-row>
                <el-col :span="8">
                  <el-form-item :label="$t('mail.addresseeId')" label-width="60px" class="article-textarea" prop="addresseeId">
                    <el-input :rows="1" v-model="postForm.addresseeId" placeholder="请输入内容"/>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item :label="$t('mail.sender')" label-width="60px" class="article-textarea" prop="sender">
                    <el-input :rows="1" v-model="postForm.sender" placeholder="请输入内容"/>
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
        <!-- <el-form-item :label="$t('mail.addresseeId')" style="margin-bottom: 40px;" label-width="60px" prop="addresseeId">
          <el-input :rows="1" v-model="postForm.addresseeId" type="textarea" class="article-textarea" autosize placeholder="请输入内容"/>
        </el-form-item>
        <el-form-item :label="$t('mail.sender')" style="margin-bottom: 40px;" label-width="60px" prop="sender">
          <el-input :rows="1" v-model="postForm.sender" type="textarea" class="article-textarea" autosize placeholder="请输入内容"/>
        </el-form-item> -->
        <el-form-item :label="$t('mail.content')" style="margin-bottom: 40px;" label-width="60px" prop="content">
          <el-input :rows="1" v-model="postForm.content" type="textarea" class="article-textarea" autosize placeholder="请输入内容"/>
          <span v-show="contentShortLength" class="word-counter">{{ contentShortLength }}字</span>
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
  status: 'draft',
  title: '', // 文章题目
  addresseeId: '',
  sender: '',
  content: '', // 文章内容
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
        title: [{ validator: validateRequire }],
        content: [{ validator: validateRequire }],
        addresseeId: [{ validator: validateRequire }],
        sender: [{ validator: validateRequire }]
      },
      tempRoute: {}
    }
  },
  computed: {
    contentShortLength() {
      return this.postForm.content.length
    },
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
    submitForm() {
      // this.postForm.display_time = parseInt(this.display_time / 1000)
      console.log(this.postForm)
      this.$refs.postForm.validate(valid => {
        if (valid) {
          this.loading = true
          // this.$notify({
          //   title: '成功',
          //   message: '发布文章成功',
          //   type: 'success',
          //   duration: 2000
          // })
          axios.post(
            'http://127.0.0.1:22222/mail',
            this.postForm
          ).then((res) => {
            this.$notify({
              title: '成功',
              message: '发送邮件成功.',
              type: 'success',
              duration: 4000
            })
          }).catch((error) => {
            this.$notify({
              title: '失败',
              message: '发送邮件成功失败:' + error,
              type: 'fail',
              duration: 4000
            })
          })
          this.postForm.status = 'published'
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
