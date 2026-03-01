import { useState, useEffect, type FormEvent } from 'react';
import { useFoods, useCreateFood } from '../api/hooks';
import type { Food, FoodCreate } from '../domain/types';

type FoodSearchModalProps = {
  open: boolean;
  onClose: () => void;
  onSelect: (foodId: string, grams: number) => void;
};

type Phase = 'search' | 'grams' | 'create';

const EMPTY_FOOD_FORM: FoodCreate = {
  name: '',
  calories_per_100g: 0,
  protein_g: 0,
  carbs_g: 0,
  fat_g: 0,
};

export function FoodSearchModal({ open, onClose, onSelect }: FoodSearchModalProps): React.ReactElement | null {
  const [phase, setPhase] = useState<Phase>('search');
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [grams, setGrams] = useState<string>('100');
  const [foodForm, setFoodForm] = useState<FoodCreate>(EMPTY_FOOD_FORM);

  const { data: foods = [], isLoading: loadingFoods } = useFoods(
    debouncedSearch.trim() || undefined,
  );
  const createFood = useCreateFood();

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchText);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchText]);

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setPhase('search');
      setSearchText('');
      setDebouncedSearch('');
      setSelectedFood(null);
      setGrams('100');
      setFoodForm(EMPTY_FOOD_FORM);
    }
  }, [open]);

  function handleSelectFood(food: Food): void {
    setSelectedFood(food);
    setGrams('100');
    setPhase('grams');
  }

  function handleConfirmGrams(): void {
    if (!selectedFood) return;
    const gramsNum = parseFloat(grams);
    if (isNaN(gramsNum) || gramsNum <= 0) return;
    onSelect(selectedFood.id, gramsNum);
  }

  function handleCreateFood(e: FormEvent<HTMLFormElement>): void {
    e.preventDefault();
    if (foodForm.name.trim() === '') return;
    createFood.mutate(foodForm, {
      onSuccess: (created) => {
        setSelectedFood(created);
        setGrams('100');
        setPhase('grams');
      },
    });
  }

  function handleFoodFormChange(field: keyof FoodCreate, value: string): void {
    setFoodForm((prev) => ({
      ...prev,
      [field]: field === 'name' ? value : parseFloat(value) || 0,
    }));
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
      onClick={onClose}
    >
      <div
        className="card card-padding w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="food-modal-title"
      >
        {/* Search phase */}
        {phase === 'search' && (
          <>
            <div className="mb-4 flex items-center justify-between">
              <h2 id="food-modal-title" className="text-lg font-semibold text-text">
                Add Food
              </h2>
              <button type="button" className="btn btn-ghost" onClick={onClose}>
                Close
              </button>
            </div>

            <div className="input-root mb-3">
              <label className="input-label" htmlFor="food-search">
                Search foods
              </label>
              <input
                id="food-search"
                type="text"
                className="input-field"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="e.g. Chicken breast"
                autoFocus
              />
            </div>

            {loadingFoods && (
              <p className="text-sm text-text-muted">Searching...</p>
            )}

            {!loadingFoods && foods.length === 0 && debouncedSearch.trim() !== '' && (
              <p className="text-sm text-text-muted">No foods found.</p>
            )}

            {foods.length > 0 && (
              <ul className="mb-3 flex flex-col gap-1" role="listbox">
                {foods.map((food) => (
                  <li key={food.id}>
                    <button
                      type="button"
                      className="w-full rounded-md border border-border-subtle px-3 py-2 text-left text-sm transition-colors hover:border-accent hover:bg-surface-raised"
                      onClick={() => handleSelectFood(food)}
                    >
                      <span className="font-medium text-text">{food.name}</span>
                      <span className="ml-2 text-text-muted">
                        {food.calories_per_100g} kcal/100g
                      </span>
                      <span className="ml-2 text-success">P:{food.protein_g}g</span>
                      <span className="ml-1 text-warning">C:{food.carbs_g}g</span>
                      <span className="ml-1 text-danger">F:{food.fat_g}g</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <button
              type="button"
              className="btn btn-ghost w-full border border-dashed border-border-strong text-sm"
              onClick={() => setPhase('create')}
            >
              + Add new food
            </button>
          </>
        )}

        {/* Grams phase */}
        {phase === 'grams' && selectedFood && (
          <>
            <div className="mb-4 flex items-center justify-between">
              <h2 id="food-modal-title" className="text-lg font-semibold text-text">
                {selectedFood.name}
              </h2>
              <button type="button" className="btn btn-ghost" onClick={() => setPhase('search')}>
                Back
              </button>
            </div>

            <p className="mb-3 text-sm text-text-muted">
              {selectedFood.calories_per_100g} kcal / 100g &mdash; P:{selectedFood.protein_g}g C:{selectedFood.carbs_g}g F:{selectedFood.fat_g}g
            </p>

            <div className="input-root mb-4">
              <label className="input-label" htmlFor="food-grams">
                Grams
              </label>
              <input
                id="food-grams"
                type="number"
                className="input-field"
                value={grams}
                onChange={(e) => setGrams(e.target.value)}
                min={1}
                step={1}
                autoFocus
              />
            </div>

            <div className="flex justify-end gap-2">
              <button type="button" className="btn btn-ghost" onClick={onClose}>
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleConfirmGrams}
                disabled={parseFloat(grams) <= 0 || isNaN(parseFloat(grams))}
              >
                Add
              </button>
            </div>
          </>
        )}

        {/* Create food phase */}
        {phase === 'create' && (
          <>
            <div className="mb-4 flex items-center justify-between">
              <h2 id="food-modal-title" className="text-lg font-semibold text-text">
                New Food
              </h2>
              <button type="button" className="btn btn-ghost" onClick={() => setPhase('search')}>
                Back
              </button>
            </div>

            <form onSubmit={handleCreateFood} className="flex flex-col gap-3">
              <div className="input-root">
                <label className="input-label" htmlFor="new-food-name">
                  Name
                </label>
                <input
                  id="new-food-name"
                  type="text"
                  className="input-field"
                  value={foodForm.name}
                  onChange={(e) => handleFoodFormChange('name', e.target.value)}
                  placeholder="e.g. Chicken breast"
                  required
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="input-root">
                  <label className="input-label" htmlFor="new-food-cal">
                    Calories / 100g
                  </label>
                  <input
                    id="new-food-cal"
                    type="number"
                    className="input-field"
                    value={foodForm.calories_per_100g || ''}
                    onChange={(e) => handleFoodFormChange('calories_per_100g', e.target.value)}
                    min={0}
                    step={0.1}
                    required
                  />
                </div>

                <div className="input-root">
                  <label className="input-label" htmlFor="new-food-protein">
                    Protein (g)
                  </label>
                  <input
                    id="new-food-protein"
                    type="number"
                    className="input-field"
                    value={foodForm.protein_g || ''}
                    onChange={(e) => handleFoodFormChange('protein_g', e.target.value)}
                    min={0}
                    step={0.1}
                    required
                  />
                </div>

                <div className="input-root">
                  <label className="input-label" htmlFor="new-food-carbs">
                    Carbs (g)
                  </label>
                  <input
                    id="new-food-carbs"
                    type="number"
                    className="input-field"
                    value={foodForm.carbs_g || ''}
                    onChange={(e) => handleFoodFormChange('carbs_g', e.target.value)}
                    min={0}
                    step={0.1}
                    required
                  />
                </div>

                <div className="input-root">
                  <label className="input-label" htmlFor="new-food-fat">
                    Fat (g)
                  </label>
                  <input
                    id="new-food-fat"
                    type="number"
                    className="input-field"
                    value={foodForm.fat_g || ''}
                    onChange={(e) => handleFoodFormChange('fat_g', e.target.value)}
                    min={0}
                    step={0.1}
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button type="button" className="btn btn-ghost" onClick={onClose}>
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={createFood.isPending || foodForm.name.trim() === ''}
                >
                  {createFood.isPending ? 'Saving...' : 'Create Food'}
                </button>
              </div>

              {createFood.isError && (
                <p className="text-sm text-danger">Failed to create food. Please try again.</p>
              )}
            </form>
          </>
        )}
      </div>
    </div>
  );
}
