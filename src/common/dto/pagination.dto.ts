import { ApiProperty } from '@nestjs/swagger';

/**
 * Metadata cho pagination
 */
export class PaginationMetaDto {
    @ApiProperty({ example: 1, description: 'Trang hiện tại' })
    currentPage: number;

    @ApiProperty({ example: 10, description: 'Số item trên 1 trang' })
    itemsPerPage: number;

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
    meta: PaginationMetaDto;
}