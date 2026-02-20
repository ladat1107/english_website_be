import { ApiProperty } from '@nestjs/swagger';

/**
 * Metadata cho pagination
 */
export class PaginationMetaDto {
    @ApiProperty({ example: 1, description: 'Trang hiện tại' })
    currentPage: number;

    @ApiProperty({ example: 10, description: 'Số item trên 1 trang' })
    limit: number;

    @ApiProperty({ example: 100, description: 'Tổng số item' })
    totalItems: number;

    @ApiProperty({ example: 10, description: 'Tổng số trang' })
    totalPages: number;

    @ApiProperty({ example: true, description: 'Có trang tiếp theo không' })
    hasNextPage: boolean;

    @ApiProperty({ example: false, description: 'Có trang trước không' })
    hasPreviousPage: boolean;
}

/**
 * Response chuẩn cho API có phân trang
 */
export class PaginatedResponseDto<T> {
    @ApiProperty({
        description: 'Mảng dữ liệu',
        isArray: true,
    })
    items: T[];

    @ApiProperty({
        description: 'Metadata phân trang',
        type: PaginationMetaDto,
    })
    pagination: PaginationMetaDto;
}

export function createPaginatedResponse<T>(
    items: T[],
    totalItems: number,
    page: number,
    limit: number,
): PaginatedResponseDto<T> {
    const totalPages = Math.ceil(totalItems / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    const pagination: PaginationMetaDto = {
        currentPage: page,
        limit,
        totalItems,
        totalPages,
        hasNextPage,
        hasPreviousPage,
    };

    return {
        items,
        pagination: pagination,
    };
}

/**
 * Tính skip offset cho MongoDB
 */
export function calculateSkip(page: number, limit: number): number {
    return (page - 1) * limit;
}