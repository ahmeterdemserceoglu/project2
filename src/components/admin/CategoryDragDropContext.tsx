"use client";

import React, { createContext, useState, useContext, ReactNode } from 'react';
import { Database } from '@/types/supabase';

type Category = Database['public']['Tables']['categories']['Row'] & { children?: Category[] };

interface DragDropContextProps {
  children: ReactNode;
  onCategoryMove?: (sourceId: string, targetId: string | null, position: 'before' | 'after' | 'inside') => void;
}

interface DragDropContextValue {
  draggedCategory: Category | null;
  dropTargetId: string | null;
  dropPosition: 'before' | 'after' | 'inside' | null;
  isDragging: boolean;
  startDrag: (category: Category) => void;
  endDrag: () => void;
  setDropTarget: (targetId: string | null, position: 'before' | 'after' | 'inside' | null) => void;
  handleDrop: () => void;
}

const CategoryDragDropContext = createContext<DragDropContextValue | undefined>(undefined);

export const useCategoryDragDrop = () => {
  const context = useContext(CategoryDragDropContext);
  if (!context) {
    throw new Error('useCategoryDragDrop must be used within a CategoryDragDropProvider');
  }
  return context;
};

export const CategoryDragDropProvider: React.FC<DragDropContextProps> = ({ children, onCategoryMove }) => {
  const [draggedCategory, setDraggedCategory] = useState<Category | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);
  const [dropPosition, setDropPosition] = useState<'before' | 'after' | 'inside' | null>(null);

  const startDrag = (category: Category) => {
    setDraggedCategory(category);
  };

  const endDrag = () => {
    setDraggedCategory(null);
    setDropTargetId(null);
    setDropPosition(null);
  };

  const setDropTarget = (targetId: string | null, position: 'before' | 'after' | 'inside' | null) => {
    setDropTargetId(targetId);
    setDropPosition(position);
  };

  const handleDrop = () => {
    if (draggedCategory && dropTargetId && dropPosition && onCategoryMove) {
      onCategoryMove(draggedCategory.id, dropTargetId, dropPosition);
    }
    endDrag();
  };

  const value = {
    draggedCategory,
    dropTargetId,
    dropPosition,
    isDragging: !!draggedCategory,
    startDrag,
    endDrag,
    setDropTarget,
    handleDrop,
  };

  return (
    <CategoryDragDropContext.Provider value={value}>
      {children}
    </CategoryDragDropContext.Provider>
  );
};

// Helper component for drag indicators
export const DropIndicator = ({ 
  position, 
  isActive 
}: { 
  position: 'before' | 'after' | 'inside', 
  isActive: boolean 
}) => {
  if (!isActive) return null;
  
  if (position === 'inside') {
    return (
      <div className="absolute inset-0 border-2 border-blue-500 rounded-md bg-blue-500/10 z-10"></div>
    );
  }
  
  return (
    <div 
      className={`absolute left-0 right-0 h-1 bg-blue-500 z-10 ${position === 'before' ? 'top-0' : 'bottom-0'}`}
    >
      <div className="absolute -left-1 -top-1 w-3 h-3 rounded-full bg-blue-500"></div>
    </div>
  );
};

export default CategoryDragDropProvider; 