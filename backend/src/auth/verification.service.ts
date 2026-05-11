import { Injectable } from '@nestjs/common';

@Injectable()
export class VerificationService {
  /**
   * Simulates AI-based Face Similarity and OCR
   * In a real app, this would call AWS Rekognition, Azure Face API, or similar.
   */
  async verifyIdentity(idImage: string, selfieImage: string) {
    // Simulate API latency
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Simulate AI score (85% to 99% for success, 10% to 40% for failure)
    // We'll make it succeed most of the time for this demo
    const randomScore = Math.random() * (0.99 - 0.85) + 0.85;
    const isMatched = randomScore > 0.8;

    return {
      success: isMatched,
      score: parseFloat(randomScore.toFixed(4)),
      idType: this.determineIdType(idImage),
      extractedName: 'John Doe', // Simulated OCR
    };
  }

  private determineIdType(filename: string): string {
    if (filename.toLowerCase().includes('passport')) return 'PASSPORT';
    if (filename.toLowerCase().includes('aadhar')) return 'AADHAR';
    if (filename.toLowerCase().includes('license')) return 'DRIVING_LICENSE';
    return 'GOVERNMENT_ID';
  }
}
