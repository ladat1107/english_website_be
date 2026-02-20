export function buildVietnameseRegex(input: string) {
    const map: Record<string, string> = {
        a: 'aàáạảãâầấậẩẫăằắặẳẵ',
        e: 'eèéẹẻẽêềếệểễ',
        i: 'iìíịỉĩ',
        o: 'oòóọỏõôồốộổỗơờớợởỡ',
        u: 'uùúụủũưừứựửữ',
        y: 'yỳýỵỷỹ',
        d: 'dđ',
    };

    return input
        .toLowerCase()
        .split('')
        .map(char => {
            if (map[char]) {
                return `[${map[char]}${map[char].toUpperCase()}]`;
            }
            return char;
        })
        .join('');
}
