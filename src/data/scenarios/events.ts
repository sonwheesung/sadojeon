export interface EventChoice {
  id: string;
  label: string;
  outcome: string;
}

export interface EventTemplate {
  id: string;
  title: string;
  hanjaTitle?: string;
  body: string;
  choices: EventChoice[];
  tags?: string[];
}

export const EVENTS: EventTemplate[] = [];
