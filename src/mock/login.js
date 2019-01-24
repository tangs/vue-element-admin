import { param2Obj } from '@/utils'

const userMap = {
  admin: {
    roles: ['admin'],
    token: 'admin',
    introduction: '我是超级管理员',
    avatar: 'https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif',
    name: 'Super Admin'
  },
  editor: {
    roles: ['editor'],
    token: 'editor',
    introduction: '我是编辑',
    avatar: 'https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif',
    name: 'Normal Editor'
  }
}

export default {
  loginByUsername: config => {
    const { username } = JSON.parse(config.body)
    return userMap[username]
  },
  // loginByUsername: config => {
  //   return new Promise((resolve, reject) => {
  //     const data = JSON.parse(config.body)
  //     const params = {
  //       username: data.username
  //     }
  //     params.token = md5(data.username + data.password)
  //     console.log('req:' + config.body)
  //     console.log('req:' + JSON.stringify(params))
  //     const fail = (error) => {
  //       console.log('error:' + error)
  //       reject(error)
  //     }
  //     axios.get(
  //       'http://120.132.50.206:8585/login.php',
  //       {
  //         params: params
  //       }
  //     ).then((res) => {
  //       const resData = res.data
  //       const str = JSON.stringify(resData)
  //       console.log('res:' + str)
  //       if (resData.result === 'true') {
  //         const { username } = JSON.parse(config.body)
  //         resolve(userMap[username])
  //       } else {
  //         fail(resData.param)
  //       }
  //     }).catch((error) => {
  //       fail(error)
  //     })
  //   })
  // },
  getUserInfo: config => {
    const { token } = param2Obj(config.url)
    if (userMap[token]) {
      return userMap[token]
    } else {
      return false
    }
  },
  logout: () => 'success'
}
