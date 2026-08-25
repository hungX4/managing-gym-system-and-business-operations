import { IsString, IsNotEmpty, IsOptional, IsEmail, Matches } from 'class-validator';
//create trial lead for new user
export interface CreateTrialLeadDto {
    fullName: string;
    phoneNumber: string;
    email?: string;
    note?: string; // Khách hàng tự note trên web (VD: "Tôi muốn giảm cân")
}