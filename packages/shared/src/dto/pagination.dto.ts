// @gym/shared/src/dto/pagination.dto.ts
export class PaginationMetaDto {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
}

export class PaginatedResponseDto<T> {
    data: T[]; // Mảng chứa các DTO cụ thể (ví dụ: SubscriptionHistoryResponseDto[])
    meta: PaginationMetaDto;
}