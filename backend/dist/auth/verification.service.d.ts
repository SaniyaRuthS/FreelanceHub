export declare class VerificationService {
    verifyIdentity(idImage: string, selfieImage: string): Promise<{
        success: boolean;
        score: number;
        idType: string;
        extractedName: string;
    }>;
    private determineIdType;
}
