import { create } from 'zustand';
import { getWeekMonday } from '../domain/meals';

type MealStore = {
  weekMonday: Date;
  setWeekMonday: (d: Date) => void;
  prevWeek: () => void;
  nextWeek: () => void;
};

export const useMealStore = create<MealStore>(() => {
  const monday = getWeekMonday(new Date());
  return {
    weekMonday: monday,
    setWeekMonday: (d) => useMealStore.setState({ weekMonday: d }),
    prevWeek: () =>
      useMealStore.setState((s) => {
        const d = new Date(s.weekMonday);
        d.setDate(d.getDate() - 7);
        return { weekMonday: d };
      }),
    nextWeek: () =>
      useMealStore.setState((s) => {
        const d = new Date(s.weekMonday);
        d.setDate(d.getDate() + 7);
        return { weekMonday: d };
      }),
  };
});
