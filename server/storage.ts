import { db } from "./db";
import { messages, type InsertMessage, type Message } from "@shared/schema";
import { eq } from "drizzle-orm";
import { encrypt, decrypt } from "./encryption";

export interface IStorage {
  createMessage(message: InsertMessage): Promise<Message>;
  getMessageAndDelete(id: string): Promise<Message | undefined>;
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
    const [message] = await db
      .insert(messages)
      .values(encryptMessage(insertMessage))
      .returning();
    return message;
  }

  async getMessageAndDelete(id: string): Promise<Message | undefined> {
    const [message] = await db
      .delete(messages)
      .where(eq(messages.id, id))
      .returning();
    if (!message) return undefined;
    return decryptMessage(message);
  }
}

export const storage = new DatabaseStorage();
