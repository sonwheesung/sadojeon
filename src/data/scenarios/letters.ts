export interface LetterTemplate {
  id: string;
  senderName: string;
  title: string;
  body: string;
  tags?: string[];
}

export const LETTERS: LetterTemplate[] = [];
