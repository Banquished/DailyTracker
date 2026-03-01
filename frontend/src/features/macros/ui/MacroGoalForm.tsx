import { useEffect, useState } from 'react';
import { useUpdateMacroProfile } from '../api/hooks';
import type { MacroProfile, MacroProfileCreate } from '../domain/types';

type Props = {
  profile: MacroProfile | undefined;
};

type FormValues = {
  calories: string;
  protein_g: string;
  carbs_g: string;
  fat_g: string;
};

function toFormValues(profile: MacroProfile | undefined): FormValues {
  if (!profile) {
    return { calories: '', protein_g: '', carbs_g: '', fat_g: '' };
  }
  return {
    calories: String(profile.calories),
    protein_g: String(profile.protein_g),
    carbs_g: String(profile.carbs_g),
    fat_g: String(profile.fat_g),
  };
}

export function MacroGoalForm({ profile }: Props): React.ReactElement {
  const [values, setValues] = useState<FormValues>(() => toFormValues(profile));
  const { mutate, isPending, isSuccess, isError } = useUpdateMacroProfile();

  useEffect(() => {
    setValues(toFormValues(profile));
  }, [profile]);

  function handleChange(field: keyof FormValues) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setValues((prev) => ({ ...prev, [field]: e.target.value }));
    };
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>): void {
    e.preventDefault();
    const data: MacroProfileCreate = {
      calories: parseInt(values.calories, 10),
      protein_g: parseInt(values.protein_g, 10),
      carbs_g: parseInt(values.carbs_g, 10),
      fat_g: parseInt(values.fat_g, 10),
    };
    if (
      isNaN(data.calories) ||
      isNaN(data.protein_g) ||
      isNaN(data.carbs_g) ||
      isNaN(data.fat_g)
    ) {
      return;
    }
    mutate(data);
  }

  const fields: { key: keyof FormValues; label: string; placeholder: string }[] = [
    { key: 'calories', label: 'Calories (kcal)', placeholder: '2000' },
    { key: 'protein_g', label: 'Protein (g)', placeholder: '150' },
    { key: 'carbs_g', label: 'Carbs (g)', placeholder: '200' },
    { key: 'fat_g', label: 'Fat (g)', placeholder: '65' },
  ];

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {fields.map(({ key, label, placeholder }) => (
          <div key={key} className="input-root">
            <label htmlFor={`macro-${key}`} className="input-label">
              {label}
            </label>
            <input
              id={`macro-${key}`}
              type="number"
              min="0"
              className="input-field"
              placeholder={placeholder}
              value={values[key]}
              onChange={handleChange(key)}
              required
            />
          </div>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <button type="submit" className="btn btn-primary" disabled={isPending}>
          {isPending ? 'Saving…' : 'Save Goals'}
        </button>
        {isSuccess && (
          <span className="text-sm" style={{ color: 'var(--color-success)' }}>
            Saved!
          </span>
        )}
        {isError && (
          <span className="text-sm" style={{ color: 'var(--color-danger)' }}>
            Failed to save. Try again.
          </span>
        )}
      </div>
    </form>
  );
}
