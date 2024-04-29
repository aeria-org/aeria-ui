const MaskType: Map<string, RegExp> = new Map([
    [
'#',
/[0-9]/,
],
    [
'@',
/[a-zA-Z]/,
],
    [
'*',
/[a-zA-Z0-9]/,
],
])

function* getMaskIndexes(mask: string) {
    for (const char of mask) {
        yield {
            char: char,
            type: MaskType.get(char),
        }
    }
}

class Mask {
    private readonly maskInfos
    private defaultMask: typeof this.maskInfos[number]

    constructor(mask: string[]) {
        this.maskInfos = mask.map((m) => [...getMaskIndexes(m)]).sort((a, b) => a.length - b.length)
        this.defaultMask = this.maskInfos[0]
    }

    public mask = (text: string, newMask?: typeof this.maskInfos[number]): string => {
        //eslint-disable-next-line
        if (!text || !this.maskInfos) {
            return text
        }
        let result = ''
        let currentMask
        if (newMask){
            currentMask = newMask
        } else {
            this.defaultMask = currentMask = this.maskInfos.find((mask) => mask.filter((el) => el.type).length >= text.length) ?? this.defaultMask
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
            if ((!text[nonMaskIndex].match(type!) && text.length >= nonMaskIndex)) {
                //!newmask = If the mask was changed to fit another better one, cancel any new change
                //If the current character doens't match the current mask, search if there's another mask that matches it on it's same index
                if (!newMask && text[nonMaskIndex]) {
                    const matchingMask = this.maskInfos.find((mask) => text[nonMaskIndex].match(mask[maskCharIndex]?.type!))
                    if (matchingMask) {
                        const matchingMaskResult = this.mask(text, matchingMask)
                        if (matchingMaskResult.length >= result.length) {
                            this.defaultMask = matchingMask
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

    public unmask = (text: string) => {
        return text.split('').reduce((result, value, index) => {
            if (index >= this.defaultMask.length || this.defaultMask[index].char !== value) {
                result += value
            }
            return result
        }, '')
    }
}

export {
 Mask,
}
