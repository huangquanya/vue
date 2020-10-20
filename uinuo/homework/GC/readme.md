## 调用栈中的垃圾回收
一个记录当前执行状态的指针ESP指向正在执行的函数
执行完成后指针向下移动，栈调用完的函数执行上下文还会存在调用栈中，如果有新的函数执行上下文会直接覆盖

## 堆中的数据是如何回收的
### 代际假说：
第一个 是大部分对象在内存中存在的时间很短，简单来说，就是很多对象一经分配内存，很快就变得不可访问；
第二个 是不死的对象，会活得更久。

在 V8 中会把堆分为**新生代**和**老生代**两个区域，新生代中存放的是生存时间短的对象，老生代中存放的生存时间久的对象。
新生代：1-8M    副垃圾回收器
老生代：大得多  主垃圾回收器

- 垃圾回收器的执行流程
    1. 第一步是标记空间中活动对象和非活动对象。所谓活动对象就是还在使用的对象，非活动对象就是可以进行垃圾回收的对象。
    2. 第二步是回收非活动对象所占据的内存。其实就是在所有的标记完成之后，统一清理内存中所有被标记为可回收的对象
    3. 第三步是做内存整理。一般来说，频繁回收对象后，内存中就会存在大量不连续空间，我们配较大连续内存的时候，就有可能出现内存不足的情况。所以最后一步需要整理这些内存碎片

- 副垃圾回收机制
    Scavenge算法：
    1. 是把新生代空间对半划分为两个区域，一半是对象区域，一半是空闲区域
    2. 新对象放入对象区域，写满时执行垃圾清理操作；
        - 首先要对对象区域中的垃圾做标记；标记完成之后，就进入垃圾清理阶段，副垃圾回收器会把这些存活的对象复制到空闲区域中，同时它还会把这些对象有序地排列
    3. 完成复制后，对象区域与空闲区域进行角色翻转
    4. 对象晋升：经过两次垃圾回收还存活的对象会被移动到老生代
- 主垃圾回收器（大对象直接存进老生区）(不使用Scavenge算法,老生代大)
    标记-清除(Mark-Sweep)
    1. 先标记 从一组根元素开始，递归遍历这组根元素，能达到的元素称为活动对象，没有达到的元素判断为垃圾数据
    标记-整理(Mark-Compact)
    2. 标记阶段同上，整理会让存活的对象向一端移动，然后直接清理掉边界以外的内存
- 全停顿(stop-the-world)
    1. js运行在主线程上，执行垃圾回收算法都需要将js脚本停下来，等垃圾回收完毕后再恢复执行
    2. 为增量标记（Incremental Marking）算法：为降低老生代的垃圾回收而造成的卡顿，v8将标记分为子标记过程，让垃圾回收标记和js交替执行