import { enablePromise, openDatabase, SQLiteDatabase } from 'react-native-sqlite-storage';
import { ToDoItem } from './ToDoItem';

enablePromise(true);

export const getDBConnection = async (): Promise<SQLiteDatabase> => {
  try {
    console.log("Opening database connection...");
    const db = await openDatabase({
      name: 'todo-data.db',
      location: 'default',
    });
    console.log("Database opened successfully");
    return db;
  } catch (error) {
    console.error("Error opening database:", error);
    throw new Error("Failed to open database");
  }
};


export const createTable = async (db: SQLiteDatabase) => {
  const query = `
    CREATE TABLE IF NOT EXISTS todoData (
      rowid INTEGER PRIMARY KEY AUTOINCREMENT,
      value TEXT NOT NULL
    );
  `;
  try {
    await db.executeSql(query);
    console.log("Table created or already exists.");
  } catch (error) {
    console.error("Error creating table:", error);
    throw new Error("Failed to create table");
  }
};

export const getTodoItems = async (db: SQLiteDatabase): Promise<ToDoItem[]> => {
  try {
    const todoItems: ToDoItem[] = [];
    const results = await db.executeSql('SELECT rowid as id, value FROM todoData');

    results.forEach(result => {
      for (let index = 0; index < result.rows.length; index++) {
        todoItems.push(result.rows.item(index));
      }
    });

    return todoItems;
  } catch (error) {
    console.error("Error getting todo items:", error);
    throw new Error('Failed to get todoItems!');
  }
};

export const saveTodoItems = async (db: SQLiteDatabase, todoItems: ToDoItem[]) => {
  const insertQuery =
    `INSERT OR REPLACE INTO todoData (rowid, value) VALUES ` +
    todoItems.map(i => `(${i.id}, '${i.value}')`).join(',');

  try {
    await db.executeSql(insertQuery);
    console.log("Todo items saved successfully.");
  } catch (error) {
    console.error("Error saving todo items:", error);
    throw new Error("Failed to save todo items");
  }
};

export const deleteTodoItem = async (db: SQLiteDatabase, id: number) => {
  const deleteQuery = `DELETE FROM todoData WHERE rowid = ${id}`;
  try {
    await db.executeSql(deleteQuery);
    console.log("Todo item deleted successfully.");
  } catch (error) {
    console.error("Error deleting todo item:", error);
    throw new Error("Failed to delete todo item");
  }
};

export const deleteTable = async (db: SQLiteDatabase) => {
  const query = `DROP TABLE IF EXISTS todoData`;
  try {
    await db.executeSql(query);
    console.log("Table deleted successfully.");
  } catch (error) {
    console.error("Error deleting table:", error);
    throw new Error("Failed to delete table");
  }
};
