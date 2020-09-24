import {ref,onMounted, computed} from 'vue'

export default function useClock(){
    let date = ref(new Date());
    onMounted(()=>{
        setInterval(()=>{
            console.log(1)
            date.value = new Date()
        },1000)
    })
    let time = computed(()=>{
        return date.value.toLocaleTimeString()
    })
    return time;
}