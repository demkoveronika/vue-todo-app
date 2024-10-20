import { client } from "@/utils/httpClient"

export const USER_ID = 874;

export const getTodos = () => {
  return client.get(`/todos?userId=${USER_ID}`);
}

export const createTodo = (title) => {
  return client.post('/todos', {
    title,
    completed: false,
    userId: USER_ID,
  });
}

export const updateTodo = ({ id, title, completed }) => {
  return client.patch(`/todos/${id}`, {
    title,
    completed,
  });
}

export const deleteTodo = (todoId) => {
  return client.delete(`/todos/${todoId}`);
}
