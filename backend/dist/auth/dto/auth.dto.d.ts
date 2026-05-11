export declare class RegisterDto {
    email: string;
    password: string;
    name: string;
    role: 'BUYER' | 'SELLER';
    idType?: string;
    idCardImage?: string;
    selfieImage?: string;
}
export declare class LoginDto {
    email: string;
    password: string;
}
