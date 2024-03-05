import { defineComponent, h, ref } from 'vue'

export const AeriaAsync = defineComponent({
  props: {
    initialValue: String,
    promise: Promise<string>,
  },
  setup(props) {
    const result = ref(props.initialValue)
    if( props.promise instanceof Promise ) {
      props.promise.then((value) => {
        result.value = value
      })
    }

    return () => h('div', result.value)
  },
})
