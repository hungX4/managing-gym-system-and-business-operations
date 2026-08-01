import { SetMetadata } from '@nestjs/common';

// Định nghĩa một hằng số làm chìa khóa (tránh gõ sai chính tả sau này)
export const IS_PUBLIC_KEY = 'isPublic';

// Hàm tạo Decorator @Public()
// Khi gắn lên API, nó sẽ âm thầm dán một nhãn: { isPublic: true }
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);