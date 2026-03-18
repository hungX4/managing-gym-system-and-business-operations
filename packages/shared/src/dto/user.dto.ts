
//request
export interface MemberSearchRequestDto {
    keyword: string
}

//response
export interface MemberSearchResponseDto {
    memberId: number,
    fullName: string,
    phone: string,
    remainingPtSession: number
}