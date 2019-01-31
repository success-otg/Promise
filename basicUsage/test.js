let Promise = require('./a.js')

/*let p = new Promise((resolve, reject)=>{
  resolve('买')
})*/
//测试异步
let p = new Promise((resolve, reject)=>{
  console.log(2)
  setTimeout(()=>{
    resolve('买')
  },1000)
})
p.then(data=>{
  console.log(data)
})