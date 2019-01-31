//new 的promise会直接执行, 执行器函数（executor）
let p = new Promise((resolve, reject) => {
  console.log('1')
  resolve(123)
})
p.then(value => {
  console.log(value)
})
//避免回调地狱
let fs = require('fs')
function read(file) {
  return new Promise((resolve, reject) => {
    fs.readFile(file, 'utf8', (err,data)=>{
      if(err){
        reject(err)
      }
      resolve(data)
    })
  })
}

read('./texts/a.txt').then((data)=>{
  console.log(data)
  return read('./texts/b.txt')
}).then((data)=>{
  console.log(data)
})

//then可以穿透
let pro = new Promise((resolve, reject) => {
  resolve('hello')
})
//无论有多少个then最后都能获取到data
pro.then().then().then().then(data=>{
  console.log(data)
}).catch(e=>{
  console.log(e)
})

/*
* Promise.all() 在所有异步执行完之后才执行会回调，接收一个数组，数组中的每一项都应是一个promise实例
*promise.all()的返回结果也是promise
 */

Promise.all([read('./texts/a.txt'), read('./texts/b.txt')]).then(data=>{
  console.log(data)
}).catch(e=>{
  console.log(e)
})

/*
 * Promise.race() 用法跟promise很像，指的是谁跑得快先执行谁的回调
 */

Promise.race([read('./texts/a.txt'), read('./texts/b.txt')]).then(data=>{
  console.log(data)
}).catch(e=>{
  console.log(e)
})

