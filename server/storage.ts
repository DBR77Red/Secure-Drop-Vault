import { db } from "./db";
import { messages, type InsertMessage, type Message } from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  createMessage(message: InsertMessage): Promise<Message>;
  getMessageAndDelete(id: string): Promise<Message | undefined>;
}

export class DatabaseStorage implements IStorage {
  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const [message] = await db
      .insert(messages)
      .values(insertMessage)
      .returning();
    return message;
  }

  async getMessageAndDelete(id: string): Promise<Message | undefined> {
    const [message] = await db
      .delete(messages)
      .where(eq(messages.id, id))
      .returning();
    return message;
  }
}

export const storage = new DatabaseStorage();
