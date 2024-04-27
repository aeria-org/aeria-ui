const MaskType: Map<string, RegExp> = new Map([
    ['#', /[0-9]/],
    ['@', /[a-zA-Z]/],
    ['*', /[a-zA-Z0-9]/],
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
    private biggestLength

    constructor(mask: string[]) {
        this.maskInfos = mask.map(m => [...getMaskIndexes(m)]).sort((a, b) => a.length - b.length)
        this.defaultMask = this.maskInfos[0]
        this.biggestLength = this.maskInfos[this.maskInfos.length - 1].length
    }

    public mask = (text: string, newMask?: typeof this.maskInfos[number]): string => {
        if (!text || !this.maskInfos) {
            return text
        }
        let result = ""
        const currentMask = newMask ? newMask : this.defaultMask
        for (let maskCharIndex = 0, nonMaskIndex = 0; result.length <= this.biggestLength; maskCharIndex++) {
            const { char, type } = currentMask[maskCharIndex] ?? {}
            
            //If the char doens't have any type then it's a required char
            if (nonMaskIndex < text.length && !type && char !== text[maskCharIndex]) {
                result += char
                continue
            }

            if (maskCharIndex >= currentMask.length) {
                //!newmask = If the mask was changed to fit another better one, cancel any new change
                //If the text is bigger than the current mask, search if there's any bigger mask on maskInfos
                if (!newMask && this.biggestLength !== currentMask.length && maskCharIndex == this.biggestLength - 1) {
                    const biggerMask = this.maskInfos.find(mask => mask.length > maskCharIndex)
                    if (biggerMask) {
                        const biggerMaskResult = this.mask(text, biggerMask)
                        if(biggerMaskResult.length >= result.length)
                        {
                            //If the new mask result doens't have any conflicts with this one, assign it to the default and return it
                            this.defaultMask = biggerMask
                            return biggerMaskResult
                        }
                    }
                }
                //If there's not any bigger masks, stop there
                break
            }
            if ((!text[nonMaskIndex]?.match(type!) && text.length >= nonMaskIndex)) {
                //Same logics here but with character matching
                //If the current character doens't match the current mask, search if there's another mask that matches it on it's same index
                if (!newMask && text[nonMaskIndex]) {
                    const matchingMask = this.maskInfos.find(mask => text[nonMaskIndex].match(mask[maskCharIndex]?.type!))
                    if (matchingMask) {
                        const matchingMaskResult = this.mask(text, matchingMask)
                        if(matchingMaskResult.length >= result.length)
                        {
                            this.defaultMask = matchingMask
                            return matchingMaskResult
                        }
                    }
                }

                break
            }


            result += text[nonMaskIndex]
            nonMaskIndex++

        }

        return result
    }

    public unmask = (text: string) => {
        return text?.split("").reduce((result, value, index) => {
            if (index >= this.defaultMask.length || this.defaultMask[index].char != value) {
                result += value;
            }
            return result;
        }, "");
    }
}

export { Mask }