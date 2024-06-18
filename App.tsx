import React, { useCallback, useEffect, useState } from 'react';
import {
  Button,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  useColorScheme,
  View,
} from 'react-native';
import { ToDoItemComponent } from './ToDoItemComponent';
import { ToDoItem } from './ToDoItem';
import { getDBConnection, getTodoItems, saveTodoItems, createTable, deleteTodoItem } from './TodoData';

const App = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const [todos, setTodos] = useState<ToDoItem[]>([]);
  const [newTodo, setNewTodo] = useState('');

  const loadDataCallback = useCallback(async () => {
    try {
      console.log("Opening database connection...");
      const db = await getDBConnection();
      console.log("Database connection opened.");

      console.log("Creating table if not exists...");
      await createTable(db);
      console.log("Table created or already exists.");

      console.log("Loading stored todo items...");
      const storedTodoItems = await getTodoItems(db);
      console.log("Stored items loaded:", storedTodoItems);

      if (storedTodoItems.length) {
        setTodos(storedTodoItems);
      } else {
        const initTodos = [
          { id: 0, value: 'Go to shop' },
          { id: 1, value: 'Eat at least one healthy food' },
          { id: 2, value: 'Do some exercises' }
        ];
        await saveTodoItems(db, initTodos);
        setTodos(initTodos);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    }
  }, []);

  useEffect(() => {
    loadDataCallback();
  }, [loadDataCallback]);

  const addTodo = async () => {
    if (!newTodo.trim()) return;
    try {
      const newTodos = [
        ...todos,
        {
          id: todos.length ? Math.max(...todos.map(todo => todo.id)) + 1 : 0,
          value: newTodo
        }
      ];
      setTodos(newTodos);

      const db = await getDBConnection();
      await saveTodoItems(db, newTodos);
      setNewTodo('');
    } catch (error) {
      console.error("Error adding todo:", error);
    }
  };

  const deleteItem = async (id: number) => {
    try {
      const db = await getDBConnection();
      await deleteTodoItem(db, id);
      setTodos(todos.filter(todo => todo.id !== id));
    } catch (error) {
      console.error("Error deleting todo:", error);
    }
  };

  return (
    <SafeAreaView>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <ScrollView contentInsetAdjustmentBehavior="automatic">
        <View style={styles.appTitleView}>
          <Text style={styles.appTitleText}>ToDo Application</Text>
        </View>
        <View>
          {todos.map(todo => (
            <ToDoItemComponent key={todo.id} todo={todo} deleteItem={deleteItem} />
          ))}
        </View>
        <View style={styles.textInputContainer}>
          <TextInput style={styles.textInput} value={newTodo} onChangeText={setNewTodo} />
          <Button
            onPress={addTodo}
            title="Add ToDo"
            color="#841584"
            accessibilityLabel="add todo item"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  appTitleView: {
    marginTop: 20,
    justifyContent: 'center',
    flexDirection: 'row',
  },
  appTitleText: {
    fontSize: 24,
    fontWeight: '800'
  },
  textInputContainer: {
    marginTop: 30,
    marginLeft: 20,
    marginRight: 20,
    borderRadius: 10,
    borderColor: 'black',
    borderWidth: 1,
    justifyContent: 'flex-end'
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 5,
    height: 30,
    margin: 10,
    backgroundColor: 'pink'
  },
});

export default App;
