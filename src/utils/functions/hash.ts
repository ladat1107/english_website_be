import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10; // số vòng tính toán (cost factor)

export async function hashData(plainData: string): Promise<string> {
    // bcrypt.hash tự động tạo salt rồi hash
    const hashed = await bcrypt.hash(plainData, SALT_ROUNDS);
    return hashed;
}

export async function compareData(
    plainData: string,
    hashedData: string
): Promise<boolean> {
    const isMatch = await bcrypt.compare(plainData, hashedData);
    return isMatch;
}
