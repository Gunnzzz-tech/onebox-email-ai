import { EventEmitter } from "events";

export const eventBus = new EventEmitter();

export type NewEmailEvent = {
  sender: string;
  subject: string;
  account: string;
  category: string;
  snippet: string;
  date: string | Date;
};


