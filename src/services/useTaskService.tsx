import { useSQLiteContext } from "expo-sqlite";
import { drizzle } from "drizzle-orm/expo-sqlite";
import * as taskSchema from "../database/schemas/taskSchema";
import { eq } from "drizzle-orm";
import { useState } from "react";
import type { Task } from "../types";
import { useTaskStore } from "../store/task";

export default function useTaskService() {
  const database = useSQLiteContext();
  const db = drizzle(database, { schema: taskSchema });

  const { setTasks } = useTaskStore();

  async function fetchTasks() {
    try {
      const task = await db.query.task.findMany({
        where: eq(taskSchema.task.isDone, 0),
      });

      setTasks(task);
    } catch (error) {
      console.error(error);
    }
  }

  async function createTask(title: string, description: string) {
    try {
      await db.insert(taskSchema.task).values({
        title,
        description,
      });
      fetchTasks();
    } catch (error) {
      console.error(error);
    }
  }

  async function deleteTask(id: number) {
    try {
      await db.delete(taskSchema.task).where(eq(taskSchema.task.id, id));
      fetchTasks();
    } catch (error) {
      console.error(error);
    }
  }

  async function updateTask(id: number, isDone: number) {
    try {
      await db
        .update(taskSchema.task)
        .set({ isDone })
        .where(eq(taskSchema.task.id, id));
      fetchTasks();
    } catch (error) {
      console.error(error);
    }
  }

  return {
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
  };
}
