import { create } from 'zustand';

type TodoStore = {
  selectedDate: Date;
  setSelectedDate: (d: Date) => void;
};

export const useTodoStore = create<TodoStore>(() => ({
  selectedDate: new Date(),
  setSelectedDate: (d: Date) => {
    useTodoStore.setState({ selectedDate: d });
  },
}));
