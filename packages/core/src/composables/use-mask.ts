const MaskType = {
  '#': /[0-9]/,
  '@': /[a-zA-Z]/,
  '*': /[a-zA-Z0-9]/,
} as const

function* getMaskIndexes(mask: string) {
  for (const char of mask) {
    yield {
      char,
      type: <RegExp | undefined>MaskType[char as keyof (typeof MaskType)],
    }
  }
}

export const useMask = (mask: string | readonly string[]) => {
  const maskInfos = typeof mask === 'string'
    ? [[...getMaskIndexes(mask)]]
    : mask.map((m) => [...getMaskIndexes(m)]).sort((a, b) => a.length - b.length)

  let defaultMask = maskInfos[0]

  const enmask = (text: string, rawValue?: boolean, newMask?: typeof defaultMask): string => {
    if (text.length < 1 || maskInfos.length < 1) {
      return text
    }
    let result = ''
    let currentMask
    if(rawValue)
    {
      text = unmask(text)
    }

    if (newMask){
      currentMask = newMask
    } else {
      //If there is no mask to change, check if there's any mask with the length bigger or equal to the text, otherwise mantain the default mask
      defaultMask = currentMask = maskInfos.find((mask) => mask.filter((el) => el.type).length >= text.length) ?? defaultMask
    }
    for (let maskCharIndex = 0, nonMaskIndex = 0; nonMaskIndex < text.length; maskCharIndex++) {
      const { char, type } = currentMask[maskCharIndex] ?? {}

      //If the char doens't have any type then it's a required char
      if (nonMaskIndex < text.length && !type && char !== text[maskCharIndex]) {
        result += char
        continue
      }

      if (maskCharIndex >= currentMask.length) {
        //If the current character exceeds the limit of the current mask, stop here
        break
      }
      if ((type !== undefined && !text[nonMaskIndex].match(type)) && text.length >= nonMaskIndex) {
        //!newmask = If the mask was changed to fit another better one, cancel any new change
        //If the current character doens't match the current mask, search if there's another mask that matches it on it's same index
        if (!newMask && text[nonMaskIndex]) {
          const matchingMask = maskInfos.find((mask) => text[nonMaskIndex].match(mask[maskCharIndex].type as RegExp))
          if (matchingMask) {
            const matchingMaskResult = enmask(text, false, matchingMask)
            if (matchingMaskResult.length >= result.length) {
              defaultMask = matchingMask
              return matchingMaskResult
            }
          }
        }
        //If another mask that matches the current char was not found, stop there
        break
      }
      result += text[nonMaskIndex]
      nonMaskIndex++
    }

    return result
  }

  const unmask = (text: string) => {
    return text.split('').reduce((result, value, index) => {
      if (index >= defaultMask.length || defaultMask[index].char !== value) {
        result += value
      }
      return result
    }, '')
  }

  return {
    enmask,
    unmask,
  }
}
