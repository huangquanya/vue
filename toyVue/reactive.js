
// 保存查对应关系地址
let effects = new WeakMap();
// 当前需绑定的回调
let currentEffect = null;

/**
 * 
 * @description 绑定视图更新的回调函数
 * @param {function} fn 
 */
function effect(fn){
    currentEffect = fn
    fn();
    currentEffect = null;
}
/**
 * 
 * @description 代理对象,并对对象进行绑定get和set操作
 * @param {*} object 需要被代理对象
 * @return {object} 返回代理后的对象
 * 
 */ 
function reactive(object){
    let observed = new Proxy(object,{
    //   监听get操作
      get(object, property){
        //   判断是否需要绑定回调
          if(currentEffect){
            //   如果不存在建对象
              if(!effects.has(object))effects.set(object, new Map);
            //   如不存在对象的属性则建属性下面的回调数组
              if(!effects.get(object).has(property))effects.get(object).set(property,new Array);
            //   存修改所绑定对象的修改方法
              effects.get(object).get(property).push(currentEffect)
          }
          return object[property]
      },
    //   set操作
      set(object, property, value){
        object[property] = value;
        // 取出修改变量的回调数组并调用的
        if(effects.has(object) && effects.get(object).has(property)){
            // 查到对象绑定的回调
            for(let effect of effects.get(object).get(property)){
                // 调用修改的函数
                effect();
            } 
        }
          return value
      }
  })
  return observed
}

let dummy,dummy1
const counter = reactive({num:0})
effect(()=>(dummy = counter.num))
effect(()=>(dummy1 = counter.num))

console.log(dummy)
console.log(dummy1)

counter.num = 7

console.log(dummy)
console.log(dummy1)

