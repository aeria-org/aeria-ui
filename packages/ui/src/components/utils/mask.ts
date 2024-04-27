const MaskType: Record<string, RegExp> = {
    '#': /[0-9]/,
    '@': /[a-zA-Z]/,
    '*': /[a-zA-Z0-9]/,
}
  
function* getCharIndexes(mask: string)
{
    for(const char of mask)
    {
        yield {
            char: char,
            type: MaskType[char],
        }
    }
}

function maskText(text: string, mask: string)
{
    if(!text || !mask)
    {
        return
    }
    const maskInfo = [...getCharIndexes(mask)]
    var result = ""
    for(let i = 0, y = 0; i < mask.length; i++)
    {
        const { char, type } = maskInfo[i]

        if(i < text.length && !type && char !== text[i])
        {
            result += char
        }
        else
        {
            if(y >= text.length || !text[y].match(type))
                break

            result += text[y]
            y++
        }
    }
    return result
}

export { maskText }