import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const messages = pgTable("messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  content: text("content"),
  fileData: text("file_data"),
  fileName: text("file_name"),
  fileType: text("file_type"),
  type: text("type").notNull(), // 'text', 'url', 'file'
  createdAt: timestamp("created_at").defaultNow(),
  expiresAt: timestamp("expires_at").notNull(),
});

const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5MB

export const insertMessageSchema = createInsertSchema(messages).pick({
  content: true,
  fileData: true,
  fileName: true,
  fileType: true,
  type: true,
}).refine((data) => {
  if (!data.fileData) return true;
  const base64 = data.fileData.includes(",") ? data.fileData.split(",")[1] : data.fileData;
  const padding = (base64.match(/=+$/) || [""])[0].length;
  const byteSize = Math.ceil(base64.length * 3 / 4) - padding;
  return byteSize <= MAX_FILE_BYTES;
}, { message: "File size must not exceed 5MB.", path: ["fileData"] });

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;
