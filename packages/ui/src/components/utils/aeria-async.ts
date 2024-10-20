import { defineComponent, h, ref } from 'vue'

export const AeriaAsync = defineComponent({
  props: {
    initialValue: String,
    promise: Promise<unknown>,
  },
  setup(props) {
    const result = ref<unknown>(props.initialValue)
    if( props.promise instanceof Promise ) {
      props.promise.then((value) => {
        result.value = value
      })
    }

    return () => h('div', String(result.value))
  },
})
