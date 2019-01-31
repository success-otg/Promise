class Promise {
  constructor(executor) {
  //      default status
    this.status = 'pending'
  //  fulfilled
    this.value = undefined
  //  rejected reason
    this.reason = undefined
  //  success array
    this.onResolvedCallbacks = []
  //  fail array
    this.onRejectedCallbacks = []
  //  fulfilled func
    let fulfilled = (value)=>{
    //  prevent status change
      if (this.status === 'pending'){
        this.status = 'resolved'
        this.value = value
        this.onResolvedCallbacks.forEach(fun=>fun())
      }
    }
  //  rejected func
    let rejected = (reason)=>{
      if (this.status === 'pending'){
        this.status = 'rejected'
        this.reason = reason
        this.onRejectedCallbacks.forEach(fun=>fun())
      }
    }
  //  default to execute the executor, maybe got errors
    try {
      executor(fulfilled, rejected)
    }catch (e) {
      rejected(e)
    }
  }
  then(onFulfilled, onRejected) {
    let promise2
    //默认成功和失败不传参数的情况
    onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : value => value
    onRejected = typeof onRejected === 'function' ? onRejected : err => {
      throw err
    }

    promise2 = new Promise((resolve, reject) => {
      if (this.status === 'resolved'){
        let x = onFulfilled(this.value)
        /**
         * 判断x是不是promise，如果是取它做结果，作为promise2成功结果
         * 要是普通返回值，作为promise2成功的结果
         * todo： resolvePromise可以解析x和promise2关系
         */
        resolvePromise(promise2, x, resolve, reject)
      }
      if (this.status === 'rejected'){
        let x = onRejected(this.reason)
        resolvePromise(promise2, x, resolve, reject)
      }
      if (this.status === 'pending'){
        this.onResolvedCallbacks.push(()=>{
          let x = onFulfilled(this.value)
          resolvePromise(promise2, x, resolve, reject)
        })
        this.onRejectedCallbacks.push(()=>{
          let x = onRejected(this.reason)
          resolvePromise(promise2, x, resolve, reject)
        })
      }
    })

    return promise2

    /*if(this.status === 'resolved'){
      onFulfilled(this.value)
    }
    if (this.status === 'rejected'){
      onRejected(this.reason)
    }
    //if status pending(asynchronous), need to do a thing
    if (this.status === 'pending'){
      this.onResolvedCallbacks.push(()=>{
        onFulfilled(this.value)
      })
      this.onRejectedCallbacks.push(()=>{
        onRejected(this.reason)
      })
    }*/
  }
}

function resolvePromise(promise2, x, resolve, reject){
  /**
   * 判断x是不是promise
   * A+规范一段代码，这个代码可以实现我们的promise和别人的promise可以进行交互
   */
  if (promise2 === x){
  //  自己不能等待自己完成
    return reject(new TypeError('循环引用'))
  }
//  x不是null或者是对象或者函数
  if (x !== null && typeof x === 'object' || typeof x === 'function'){
    let called //标识promise是否被调用过，防止成功后调用失败
    try { //防止调用then出现异常
      let then = x.then //取then的方法
      if (typeof then === 'function'){ //如果then是函数就默认是promise
        then.call(x, y =>{//call的第一个参数是this， 后面是成功和失败的回调
          if (called) return
          called = true
          //如果y是promise就继续递归解析promise
          resolvePromise(promise2, y, resolve, reject)
        }, err=>{ //只要失败就失败，不会再进行then的递归
          if (called) return
          called = true
          reject(err)
        })
      } else {
        //then 是一个普通对象
        if (called) return
        called = true
        resolve(x)
      }
    }catch (e) {
      reject(e)
    }
  }else {
    resolve(x)
  }
}

Promise.resolve = (val) => {
  return new Promise((resolve, reject) => resolve(val))
}

Promise.reject = (val) => {
  return new Promise((resolve, reject) => reject(val))
}

Promise.all = (promises) => { //返回promise，接收一个数组,处理每个参数的返回结果，有一个失败就失败，全部成功才成功
  let arr = []
  let i = 0 //i的目的是为了保证获取全部成功，来设置索引
  function processData(index, data) {
    arr[index] = data
    i++
    if (i === promises.length){
      resolve(arr)
    }
  }
  return new Promise((resolve, reject) => {
    for (let i = 0; i < promises.length; i++){
      promises[i].then(data=>{
        processData(i,data)
      }, (err)=>{ //有一个失败就失败
        reject(err)
      })
    }
  })
}

Promise.race = (promises) => { //接收一个数组，返回promise， 有一个成功就成功有一个失败就失败
  return new Promise((resolve, reject) => {
    for (let i = 0; i < promises.length; i++){
      promises[i].then(data => { // 有一个成功就成功
        resolve(data)
      }, err => { //有一个失败就失败
        reject(err)
      })
    }
  })
}

//测试
//语法糖
Promise.defer = Promise.deferred = () => {
  let dfd = {}
  dfd.promise = new Promise((resolve, reject) => {
    dfd.resolve = resolve
    dfd.reject = reject
  })
  return dfd
}

module.exports = Promise
