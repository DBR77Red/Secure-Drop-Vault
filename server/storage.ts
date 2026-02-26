import { db } from "./db";
import { messages, type InsertMessage, type Message } from "@shared/schema";
import { eq, lt } from "drizzle-orm";
import { encrypt, decrypt } from "./encryption";

const TTL_DAYS = 7;

export interface IStorage {
  createMessage(message: InsertMessage): Promise<Message>;
  getMessageAndDelete(id: string): Promise<Message | undefined>;
  deleteExpiredMessages(): Promise<void>;
}

function encryptMessage(input: InsertMessage): InsertMessage {
  return {
    ...input,
    content: input.content ? encrypt(input.content) : input.content,
    fileData: input.fileData ? encrypt(input.fileData) : input.fileData,
    fileName: input.fileName ? encrypt(input.fileName) : input.fileName,
  };
}

function decryptMessage(message: Message): Message {
  return {
    ...message,
    content: message.content ? decrypt(message.content) : message.content,
    fileData: message.fileData ? decrypt(message.fileData) : message.fileData,
    fileName: message.fileName ? decrypt(message.fileName) : message.fileName,
  };
}

export class DatabaseStorage implements IStorage {
  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const expiresAt = new Date(Date.now() + TTL_DAYS * 24 * 60 * 60 * 1000);
    const [message] = await db
      .insert(messages)
      .values({ ...encryptMessage(insertMessage), expiresAt })
      .returning();
    return message;
  }

  async getMessageAndDelete(id: string): Promise<Message | undefined> {
    const [message] = await db
      .delete(messages)
      .where(eq(messages.id, id))
      .returning();
    if (!message) return undefined;
    if (message.expiresAt < new Date()) return undefined;
    return decryptMessage(message);
  }

  async deleteExpiredMessages(): Promise<void> {
    await db.delete(messages).where(lt(messages.expiresAt, new Date()));
  }
}

export const storage = new DatabaseStorage();
