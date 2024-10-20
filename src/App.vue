<script> 
  import StatusFilter from '@/components/StatusFilter.vue';
  import TodoItem from './components/TodoItem.vue';
  import { createTodo, deleteTodo, getTodos, updateTodo } from './api/todos';
  import Message from './components/Message.vue';

  export default {
    components: {
      StatusFilter,
      TodoItem,
      Message,
    },

    data() {
      let todos = [];
      const jsonData = localStorage.getItem('todos') || '[]';

      try {
        todos = JSON.parse(jsonData);
      } catch(e) {}

      return {
        todos: [],
        title: '',
        status: 'all',
        errorMessage: '',
      }
    },
    computed: {
      activeTodos() {
        return this.todos.filter(todo => !todo.completed);
      },
      completedTodos() {
        return this.todos.filter(todo => todo.completed);
      },
      visibleTodos() {
        switch (this.status) {
          case 'active':
            return this.activeTodos;
          
          case 'completed':
            return this.completedTodos;
          
          default:
            return this.todos;
        }
      }
    },
    mounted() {
      getTodos()
        .then(({ data }) => this.todos = data)
        .catch(() => {
          this.$refs.errorMessage.show('Unable to load todos');
        });
    },
    methods: {
      handleSubmit() {
        if (!this.title) {
          this.$refs.errorMessage.show('Title should not be empty');
          return;
        }

        createTodo(this.title)
          .then(({ data }) => {
            this.todos = [...this.todos, data];
            this.title = '';
          })
          .catch(() => {
          this.$refs.errorMessage.show('Unable to add a todo');
          });
      },
      updateTodo({ id, title, completed }) {
        updateTodo({ id, title, completed })
          .then(({ data }) => {
            this.todos = this.todos.map(
              todo => todo.id !== id ? todo : data,
            )
          })
          .catch(() => {
          this.$refs.errorMessage.show('Unable to update a todo');
        });
      },
      deleteTodo(todoId) {
        deleteTodo(todoId)
          .then(() => {
            this.todos = this.todos.filter(
              todo => todo.id !== todoId,
            );
          })
          .catch(() => {
          this.$refs.errorMessage.show('Unable to delete a todo');
          });
      },
      clearCompleted() {
        const completedTodos = this.todos.filter(todo => todo.completed);
        const deletePromises = completedTodos.map(todo => deleteTodo(todo.id));

        Promise.all(deletePromises)
          .then(() => {
            this.todos = this.todos.filter(todo => !todo.completed);
          })
          .catch(() => {
            this.$refs.errorMessage.show('Unable to delete completed todos');
          });
      }
    },
  };
</script>


<template>
  <div class="todoapp">
    <h1 class="todoapp__title">todos</h1>
    <div class="todoapp__content">
      <header class="todoapp__header">
        <button class="todoapp__toggle-all" :class="{ active: activeTodos.length === 0 }"></button>
        <form @submit.prevent="handleSubmit">
          <input
            type="text"
            class="todoapp__new-todo"
            placeholder="What needs to be done?"
            v-model="title"
          />
        </form>
      </header>

      <TransitionGroup 
        name="list" 
        tag="section" 
        class="todoapp__main"
      >
        <TodoItem 
          v-for="todo, index of visibleTodos"
          :key="todo.id"
          :todo="todo"
          @update="updateTodo"
          @delete="deleteTodo(todo.id)"
        />

      </TransitionGroup>

      <footer class="todoapp__footer">
        <span class="todo-count">
          {{ activeTodos.length }} items left
        </span>

        <StatusFilter 
          v-model="status"
         />

        <button class="todoapp__clear-completed" @click="clearCompleted" v-if="activeTodos.length > 0">
          Clear completed
        </button>
      </footer>
    </div>

    <Message 
      class="is-danger" 
      ref="errorMessage"
    >
      <template #default="{ text }">
        <p>{{ text }}</p>
      </template>

      <template #header>
        <p>Server Error</p>
      </template>
    </Message>
  </div>
</template>

<style>
  .list-enter-active,
  .list-leave-active {
    max-height: 60px;
    transition: all 0.5s ease;
  }
  .list-enter-from,
  .list-leave-to {
    opacity: 0;
    max-height: 0;
    transform: scaleY(0);
  }
</style>
