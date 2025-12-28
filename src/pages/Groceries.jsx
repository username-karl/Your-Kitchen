import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ShoppingBag, Plus, Check, Trash2, ChevronDown, ChevronUp,
    Apple, Milk, Beef, Cookie, Sparkles, Package, Loader2,
    Snowflake, Coffee, Croissant
} from 'lucide-react';
import { categorizeGroceries } from '../services/geminiService.js';

// Category icons mapping
const CATEGORY_ICONS = {
    'produce': Apple,
    'dairy': Milk,
    'protein': Beef,
    'pantry': Package,
    'frozen': Snowflake,
    'beverages': Coffee,
    'bakery': Croissant,
    'snacks': Cookie,
    'other': Sparkles
};

// Category colors
const CATEGORY_COLORS = {
    'produce': 'text-green-400 bg-green-500/10',
    'dairy': 'text-blue-400 bg-blue-500/10',
    'protein': 'text-red-400 bg-red-500/10',
    'pantry': 'text-amber-400 bg-amber-500/10',
    'frozen': 'text-cyan-400 bg-cyan-500/10',
    'beverages': 'text-orange-400 bg-orange-500/10',
    'bakery': 'text-yellow-400 bg-yellow-500/10',
    'snacks': 'text-purple-400 bg-purple-500/10',
    'other': 'text-zinc-400 bg-zinc-500/10'
};

// Category display order
const CATEGORY_ORDER = ['produce', 'protein', 'dairy', 'pantry', 'frozen', 'beverages', 'bakery', 'snacks', 'other'];

const Groceries = ({ profile, onUpdateGroceries }) => {
    const navigate = useNavigate();
    const groceryList = profile?.weeklyPlan?.groceryList || [];

    const [checkedItems, setCheckedItems] = useState(new Set());
    const [newItemText, setNewItemText] = useState('');
    const [expandedCategories, setExpandedCategories] = useState(new Set(CATEGORY_ORDER));
    const [showAddInput, setShowAddInput] = useState(false);

    // AI categorization state
    const [categorizedItems, setCategorizedItems] = useState({});
    const [isLoadingCategories, setIsLoadingCategories] = useState(false);
    const [lastCategorizedList, setLastCategorizedList] = useState('');

    // Categorize items with AI when grocery list changes
    const runCategorization = useCallback(async () => {
        if (groceryList.length === 0) {
            setCategorizedItems({});
            return;
        }

        // Create a cache key from the grocery list
        const cacheKey = groceryList.map(item =>
            typeof item === 'string' ? item : item?.name || item?.item || ''
        ).join('|');

        // Skip if we already categorized this list
        if (cacheKey === lastCategorizedList) {
            return;
        }

        setIsLoadingCategories(true);
        try {
            const result = await categorizeGroceries(groceryList);
            setCategorizedItems(result);
            setLastCategorizedList(cacheKey);
        } catch (error) {
            console.error('Failed to categorize groceries:', error);
            // Fallback: put all items in 'other'
            setCategorizedItems({
                other: groceryList.map((item, index) => ({
                    index,
                    name: typeof item === 'string' ? item : item?.name || item?.item || String(item),
                    original: item
                }))
            });
        } finally {
            setIsLoadingCategories(false);
        }
    }, [groceryList, lastCategorizedList]);

    // Run categorization when grocery list changes
    useEffect(() => {
        runCategorization();
    }, [runCategorization]);

    // Toggle item checked state
    const toggleItem = (index) => {
        setCheckedItems(prev => {
            const newSet = new Set(prev);
            if (newSet.has(index)) {
                newSet.delete(index);
            } else {
                newSet.add(index);
            }
            return newSet;
        });
    };

    // Toggle category expansion
    const toggleCategory = (category) => {
        setExpandedCategories(prev => {
            const newSet = new Set(prev);
            if (newSet.has(category)) {
                newSet.delete(category);
            } else {
                newSet.add(category);
            }
            return newSet;
        });
    };

    // Clear completed items
    const clearCompleted = () => {
        if (checkedItems.size === 0) return;

        const remainingItems = groceryList.filter((_, index) => !checkedItems.has(index));
        onUpdateGroceries?.(remainingItems);
        setCheckedItems(new Set());
        setLastCategorizedList(''); // Force re-categorization
    };

    // Add new item
    const handleAddItem = () => {
        if (!newItemText.trim()) return;

        const updatedList = [...groceryList, newItemText.trim()];
        onUpdateGroceries?.(updatedList);
        setNewItemText('');
        setShowAddInput(false);
        setLastCategorizedList(''); // Force re-categorization
    };

    // Handle key press in input
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleAddItem();
        } else if (e.key === 'Escape') {
            setShowAddInput(false);
            setNewItemText('');
        }
    };

    // Count stats
    const totalItems = groceryList.length;
    const checkedCount = checkedItems.size;
    const remainingCount = totalItems - checkedCount;

    // Get sorted categories
    const sortedCategories = CATEGORY_ORDER.filter(cat =>
        categorizedItems[cat] && categorizedItems[cat].length > 0
    );

    // Empty state
    if (totalItems === 0) {
        return (
            <div className="flex-1 overflow-y-auto px-4 md:px-8 pb-24 pt-4">
                <div className="max-w-3xl mx-auto h-full flex flex-col items-center justify-center text-center">
                    <div className="w-20 h-20 rounded-full bg-zinc-800/50 flex items-center justify-center mb-6">
                        <ShoppingBag className="text-zinc-600" size={36} />
                    </div>
                    <h2 className="text-2xl font-medium text-white mb-3">Your Grocery List is Empty</h2>
                    <p className="text-zinc-500 text-sm mb-6 max-w-md">
                        Add ingredients from your meal plan recipes, or add items manually below.
                    </p>
                    <button
                        onClick={() => setShowAddInput(true)}
                        className="px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-medium transition-colors flex items-center gap-2"
                    >
                        <Plus size={18} />
                        Add First Item
                    </button>

                    {showAddInput && (
                        <div className="mt-6 w-full max-w-sm">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newItemText}
                                    onChange={(e) => setNewItemText(e.target.value)}
                                    onKeyDown={handleKeyPress}
                                    placeholder="Enter item name..."
                                    autoFocus
                                    className="flex-1 px-4 py-3 rounded-xl bg-zinc-900 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                />
                                <button
                                    onClick={handleAddItem}
                                    className="px-4 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white transition-colors"
                                >
                                    <Plus size={20} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto px-4 md:px-8 pb-24 pt-4">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h2 className="text-2xl font-medium text-white flex items-center gap-3">
                            Grocery List
                            {isLoadingCategories && (
                                <span className="flex items-center gap-2 text-sm text-orange-400 font-normal">
                                    <Loader2 size={16} className="animate-spin" />
                                    AI organizing...
                                </span>
                            )}
                        </h2>
                        <p className="text-sm text-zinc-500 mt-1">
                            {remainingCount} item{remainingCount !== 1 ? 's' : ''} remaining
                            {checkedCount > 0 && ` • ${checkedCount} checked`}
                        </p>
                    </div>
                    <div className="flex gap-3">
                        {checkedCount > 0 && (
                            <button
                                onClick={clearCompleted}
                                className="px-4 py-2 rounded-lg border border-white/10 text-sm text-zinc-400 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-2"
                            >
                                <Trash2 size={14} />
                                Clear Checked
                            </button>
                        )}
                        <button
                            onClick={() => setShowAddInput(!showAddInput)}
                            className="px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium transition-colors flex items-center gap-2"
                        >
                            <Plus size={14} />
                            Add Item
                        </button>
                    </div>
                </div>

                {/* Add Item Input */}
                {showAddInput && (
                    <div className="mb-6 p-4 rounded-2xl bg-zinc-900/50 border border-white/5">
                        <div className="flex gap-3">
                            <input
                                type="text"
                                value={newItemText}
                                onChange={(e) => setNewItemText(e.target.value)}
                                onKeyDown={handleKeyPress}
                                placeholder="Enter item name (e.g., 2 Avocados, 500g Chicken Breast)..."
                                autoFocus
                                className="flex-1 px-4 py-3 rounded-xl bg-zinc-800 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                            />
                            <button
                                onClick={handleAddItem}
                                disabled={!newItemText.trim()}
                                className="px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:bg-zinc-700 disabled:text-zinc-500 text-white font-medium transition-colors"
                            >
                                Add
                            </button>
                        </div>
                    </div>
                )}

                {/* Loading State */}
                {isLoadingCategories && sortedCategories.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <Loader2 size={32} className="text-orange-500 animate-spin mb-4" />
                        <p className="text-zinc-400">AI is organizing your groceries...</p>
                        <p className="text-zinc-500 text-sm mt-1">This only takes a moment</p>
                    </div>
                )}

                {/* Categorized Lists */}
                <div className="space-y-4">
                    {sortedCategories.map((category) => {
                        const items = categorizedItems[category];
                        if (!items || items.length === 0) return null;

                        const IconComponent = CATEGORY_ICONS[category] || Package;
                        const colorClasses = CATEGORY_COLORS[category] || CATEGORY_COLORS.other;
                        const isExpanded = expandedCategories.has(category);
                        const categoryCheckedCount = items.filter(item => checkedItems.has(item.index)).length;

                        return (
                            <div key={category} className="bg-zinc-900/50 border border-white/5 rounded-2xl overflow-hidden">
                                {/* Category Header */}
                                <button
                                    onClick={() => toggleCategory(category)}
                                    className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-lg ${colorClasses} flex items-center justify-center`}>
                                            <IconComponent size={16} />
                                        </div>
                                        <div className="text-left">
                                            <h3 className="text-sm font-medium text-white capitalize">{category}</h3>
                                            <p className="text-xs text-zinc-500">
                                                {items.length} item{items.length !== 1 ? 's' : ''}
                                                {categoryCheckedCount > 0 && ` • ${categoryCheckedCount} checked`}
                                            </p>
                                        </div>
                                    </div>
                                    {isExpanded ? (
                                        <ChevronUp size={18} className="text-zinc-500" />
                                    ) : (
                                        <ChevronDown size={18} className="text-zinc-500" />
                                    )}
                                </button>

                                {/* Items List */}
                                {isExpanded && (
                                    <div className="border-t border-white/5">
                                        {items.map((item, idx) => {
                                            const isChecked = checkedItems.has(item.index);

                                            return (
                                                <label
                                                    key={item.index}
                                                    className={`flex items-center p-4 cursor-pointer hover:bg-white/5 transition-colors ${idx < items.length - 1 ? 'border-b border-white/5' : ''
                                                        }`}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={isChecked}
                                                        onChange={() => toggleItem(item.index)}
                                                        className="hidden"
                                                    />
                                                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center mr-4 transition-all ${isChecked
                                                            ? 'bg-orange-500 border-orange-500'
                                                            : 'border-zinc-600 hover:border-zinc-500'
                                                        }`}>
                                                        {isChecked && <Check size={12} className="text-white" />}
                                                    </div>
                                                    <span className={`text-sm flex-1 ${isChecked
                                                            ? 'text-zinc-500 line-through'
                                                            : 'text-zinc-200'
                                                        }`}>
                                                        {item.name}
                                                    </span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Progress Bar */}
                {totalItems > 0 && !isLoadingCategories && (
                    <div className="mt-8 p-6 rounded-2xl bg-zinc-900/30 border border-white/5">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm text-zinc-400">Shopping Progress</span>
                            <span className="text-sm text-white font-medium">
                                {Math.round((checkedCount / totalItems) * 100)}%
                            </span>
                        </div>
                        <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-orange-500 to-orange-400 transition-all duration-300"
                                style={{ width: `${(checkedCount / totalItems) * 100}%` }}
                            />
                        </div>
                        {checkedCount === totalItems && totalItems > 0 && (
                            <p className="text-center text-green-400 text-sm mt-4">
                                ✓ All items checked! Ready for checkout.
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Groceries;
