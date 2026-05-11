import { PackageType } from '@prisma/client';
export declare class CreateGigPackageDto {
    type: PackageType;
    name: string;
    description: string;
    price: number;
    deliveryTime: number;
    features: string[];
}
export declare class CreateGigDto {
    title: string;
    description: string;
    categoryId: string;
    images: string[];
    tags: string[];
    packages: CreateGigPackageDto[];
}
export declare class GetGigsFilterDto {
    category?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    rating?: number;
}
