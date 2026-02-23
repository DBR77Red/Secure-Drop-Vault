import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api, errorSchemas } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.post(api.messages.create.path, async (req, res) => {
    try {
      const input = api.messages.create.input.parse(req.body);
      const message = await storage.createMessage(input);
      res.status(201).json(message);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get(api.messages.get.path, async (req, res) => {
    try {
      const id = req.params.id;
      const message = await storage.getMessageAndDelete(id);
      
      if (!message) {
        return res.status(404).json({ message: "Message not found or already destroyed" });
      }
      
      res.status(200).json(message);
    } catch (err) {
      res.status(404).json({ message: "Message not found or already destroyed" });
    }
  });

  return httpServer;
}
