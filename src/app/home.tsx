import { Text, StyleSheet, SafeAreaView } from "react-native";
import { colors } from "../styles/colors";
import { ScrollView } from "react-native-gesture-handler";
import Task from "../components/task";
import Button from "../components/button";
import { useCallback, useEffect, useRef, useState } from "react";
import Sheet from "../components/sheet";
import { useSQLiteContext } from "expo-sqlite";
import { drizzle } from "drizzle-orm/expo-sqlite";
import * as taskSchema from "../database/schemas/taskSchema";
import { eq } from "drizzle-orm";
import { useTaskStore } from "../store/task";
import type { Task as TaskType } from "../types";

export function Home() {
  const [isOpen, setIsOpen] = useState(false);
  const scrollRef = useRef(null);
  const [tasks, setTasks] = useState<TaskType[]>([]);

  const toggleSheet = () => {
    setIsOpen(!isOpen);
  };

  const database = useSQLiteContext();
  const db = drizzle(database, { schema: taskSchema });

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

  useEffect(() => {
    fetchTasks();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Suas tarefas do dia</Text>
      <ScrollView
        ref={scrollRef}
        style={{
          marginTop: 48,
        }}
        contentContainerStyle={{
          gap: 12,
        }}
        showsVerticalScrollIndicator={false}
      >
        {tasks.map(({ description, id, isDone, title }) => (
          <Task
            key={id}
            id={id}
            description={description}
            title={title}
            isDone={isDone}
            simultaneousHandlers={scrollRef}
            onDelete={deleteTask}
            onUpdate={updateTask}
          />
        ))}
      </ScrollView>
      <Button onPress={toggleSheet} />
      {isOpen && <Sheet onClose={toggleSheet} onSubmit={createTask} />}
      {/* {isOpen && <Sheet onClose={toggleSheet} onSubmit={createTask} />} */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 32,
    backgroundColor: colors.zinc[950],
  },
  title: {
    fontFamily: "aptos-black",
    fontSize: 48,
    color: colors.white,
  },
});
