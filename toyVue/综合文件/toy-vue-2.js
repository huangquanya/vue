export class ToyVue {
    constructor(config){
        // 拿到模板
        this.template = document.querySelector(config.el);
        // 拿到data再对其进行代理
        this.data = reactive(config.data);
        // 拿到methods并绑定this指向到data
        for(let name in config.methods){
            this[name] = () => {
                config.methods[name].apply(this.data)
            }
        }
        // 遍历模板函数
        this.traversal(this.template);
    }
    /**
     * @decs 对传入的DOM节点进行遍历， 并识别相关模板语法进行对应处理
     * @param {*} node 模板字符串节点
     */
    traversal(node){
        // 判断节点为文本节点
        if(node.nodeType === Node.TEXT_NODE) {
            // 判断为双括号形式
            if(node.textContent.trim().match(/^{{([\s\S]+)}}$/)) {
                    // 取上一个正则表达式匹配的第一个group
                    let name = RegExp.$1.trim();
                    effect(()=>node.textContent = this.data[name]);
                }
        }
        // 当节点为元素节点
        if(node.nodeType === Node.ELEMENT_NODE){
            let attributes = node.attributes;
            // 判断该节点的属性名
            for(let attribute of attributes ){
                // model语法
                if(attribute.name === 'v-model'){
                    const name = attribute.value
                    effect(()=>node.value = this.data[name]);
                    node.addEventListener('input', event => this.data[name] = node.value)
                }
                // bind语法
                if(attribute.name.match(/^v\-bind:([\s\S]+)$/)){
                    let attrname = RegExp.$1;
                    let name = attribute.value;
                    effect(()=>node.setAttribute(attrname, this.data[name]));
                }
                // on语法
                if(attribute.name.match(/^v\-on:([\s\S]+)$/)){
                    let eventName = RegExp.$1;
                    let fnName = attribute.value;
                    node.addEventListener(eventName,this[fnName])
                }
            }
        }
        // 判断是否存在子节点
        if(node.childNodes && node.childNodes.length) {
            // 递归遍历子节点
            for(let child of node.childNodes){
                this.traversal(child)
            }
        }
    }
}

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

// let dummy,dummy1
// const counter = reactive({num:0})
// effect(()=>(dummy = counter.num))
// effect(()=>(dummy1 = counter.num))

// console.log(dummy)
// console.log(dummy1)

// counter.num = 7

// console.log(dummy)
// console.log(dummy1)

