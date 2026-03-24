import { z } from "zod";

export const projectCreateSchema = z.object({
  name: z
    .string()
    .min(1, "Название проекта обязательно")
    .max(80, "Максимум 80 символов"),
  description: z
    .string()
    .max(500, "Максимум 500 символов")
    .optional()
    .nullable(),
});

export const taskCreateSchema = z.object({
  title: z
    .string()
    .min(1, "Название задачи обязательно")
    .max(120, "Максимум 120 символов"),
  description: z
    .string()
    .max(2000, "Максимум 2000 символов")
    .optional()
    .nullable(),
  status: z.enum(["TODO", "IN_PROGRESS", "REVIEW", "DONE"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  deadline: z.string().optional().nullable(),
  assigneeId: z.string().optional().nullable(),
  projectId: z.string().min(1, "Проект обязателен"),
});

export const taskUpdateSchema = z.object({
  title: z.string().min(1).max(120).optional(),
  description: z.string().max(2000).optional().nullable(),
  status: z.enum(["TODO", "IN_PROGRESS", "REVIEW", "DONE"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  deadline: z.string().optional().nullable(),
  assigneeId: z.string().optional().nullable(),
  position: z.number().optional(),
});

export const commentCreateSchema = z.object({
  body: z
    .string()
    .min(1, "Комментарий не может быть пустым")
    .max(2000, "Максимум 2000 символов"),
});

export const subtaskCreateSchema = z.object({
  title: z
    .string()
    .min(1, "Название подзадачи обязательно")
    .max(120, "Максимум 120 символов"),
});

export const subtaskUpdateSchema = z.object({
  title: z.string().min(1).max(120).optional(),
  done: z.boolean().optional(),
});

export const attachmentCreateSchema = z.object({
  name: z
    .string()
    .min(1, "Название обязательно")
    .max(255, "Максимум 255 символов"),
  url: z
    .string()
    .url("Некорректный URL")
    .max(2000, "Максимум 2000 символов"),
  mimeType: z.string().optional().nullable(),
  size: z.number().optional().nullable(),
});

export const LIMITS = {
  PROJECT_NAME: 80,
  TASK_TITLE: 120,
  TASK_DESCRIPTION: 2000,
  COMMENT_BODY: 2000,
  SUBTASK_TITLE: 120,
  ATTACHMENT_NAME: 255,
  ATTACHMENT_URL: 2000,
} as const;
