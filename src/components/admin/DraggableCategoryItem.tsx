"use client";

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useCategoryDragDrop, DropIndicator } from './CategoryDragDropContext';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parent_category_id: string | null;
  image_url: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
  children?: Category[];
}

interface DraggableCategoryItemProps {
  category: Category;
  level: number;
  isExpanded: boolean;
  onToggle: () => void;
  onNavigate?: () => void;
  renderChildren: () => React.ReactNode;
}

const DraggableCategoryItem: React.FC<DraggableCategoryItemProps> = ({ 
  category, 
  level,
  isExpanded,
  onToggle,
  onNavigate,
  renderChildren 
}) => {
  const { 
    isDragging, 
    draggedCategory, 
    startDrag, 
    endDrag, 
    setDropTarget, 
    handleDrop,
    dropTargetId,
    dropPosition
  } = useCategoryDragDrop();
  
  const itemRef = useRef<HTMLLIElement>(null);
  const [dragOver, setDragOver] = useState<'before' | 'inside' | 'after' | null>(null);
  
  const hasChildren = category.children && category.children.length > 0;
  const isCurrentlyDragged = draggedCategory?.id === category.id;
  
  // Don't allow dropping onto self or direct children
  const isValidDropTarget = !isCurrentlyDragged && draggedCategory?.id !== category.id;
  
  const handleDragStart = (e: React.DragEvent) => {
    e.stopPropagation();
    e.dataTransfer.setData('text/plain', category.id);
    e.dataTransfer.effectAllowed = 'move';
    startDrag(category);
    
    // Add a small delay to make the drag image visible
    setTimeout(() => {
      if (itemRef.current) {
        itemRef.current.classList.add('opacity-50');
      }
    }, 0);
  };
  
  const handleDragEnd = (e: React.DragEvent) => {
    e.stopPropagation();
    endDrag();
    if (itemRef.current) {
      itemRef.current.classList.remove('opacity-50');
    }
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isValidDropTarget || !itemRef.current) return;
    
    // Determine drop position (before, inside, after)
    const rect = itemRef.current.getBoundingClientRect();
    const offsetY = e.clientY - rect.top;
    const height = rect.height;
    
    let newDragOver: 'before' | 'inside' | 'after' | null = null;
    
    if (offsetY < height * 0.25) {
      newDragOver = 'before';
    } else if (offsetY > height * 0.75) {
      newDragOver = 'after';
    } else {
      newDragOver = 'inside';
    }
    
    setDragOver(newDragOver);
    setDropTarget(category.id, newDragOver);
  };
  
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(null);
    
    // Only clear drop target if we're really leaving this element
    // (and not entering a child element)
    if (!itemRef.current?.contains(e.relatedTarget as Node)) {
      setDropTarget(null, null);
    }
  };
  
  const handleItemDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(null);
    handleDrop();
  };
  
  // Determine if this category is the current drop target
  const isDropTarget = dropTargetId === category.id;
  
  return (
    <li 
      ref={itemRef}
      className={`mb-2 category-item relative ${isCurrentlyDragged ? 'opacity-50' : ''}`}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleItemDrop}
    >
      <div className={`
        flex items-center gap-2 p-3 rounded-md relative
        ${level === 0 ? 'bg-dark-lighter' : 'bg-dark-light/40'} 
        hover:bg-dark-lighter border border-transparent 
        ${isDropTarget && dropPosition === 'inside' ? 'border-blue-500 bg-blue-500/10' : 'hover:border-gray-700'}
        transition-all duration-200
        ${isDragging ? 'cursor-grab' : ''}
      `}>
        {/* Drop indicators */}
        <DropIndicator position="before" isActive={isDropTarget && dropPosition === 'before'} />
        <DropIndicator position="after" isActive={isDropTarget && dropPosition === 'after'} />
        
        {/* Expand/collapse button */}
        {hasChildren && (
          <button 
            onClick={onToggle}
            className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-white"
          >
            <span className={`transform transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M6 12.796V3.204L11.481 8 6 12.796zm.659.753l5.48-4.796a1 1 0 0 0 0-1.506L6.66 2.451C6.011 1.885 5 2.345 5 3.204v9.592a1 1 0 0 0 1.659.753z" />
              </svg>
            </span>
          </button>
        )}
        
        {/* Indentation spacer if no children */}
        {!hasChildren && <div className="w-6"></div>}
        
        {/* Drag handle */}
        <div className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-white cursor-grab">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9h8M8 15h8" />
          </svg>
        </div>
        
        {/* Category icon */}
        <div className="w-8 h-8 bg-primary/20 rounded-md flex items-center justify-center text-primary">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
        </div>
        
        {/* Category name and info */}
        <div className="flex-1" onClick={onNavigate} style={{ cursor: onNavigate ? 'pointer' : 'default' }}>
          <div className="font-medium text-white">{category.name}</div>
          {category.description && (
            <div className="text-sm text-gray-400 truncate max-w-md">{category.description}</div>
          )}
        </div>
        
        {/* Category count badge */}
        {hasChildren && (
          <div className="px-2 py-0.5 bg-gray-700 text-gray-300 text-xs rounded-full">
            {category.children!.length}
          </div>
        )}
        
        {/* Actions */}
        <div className="flex items-center gap-2">
          <Link 
            href={`/admin/categories/${category.id}`} 
            className="text-sm px-3 py-1.5 bg-primary text-white rounded-md hover:bg-primary-dark transition"
          >
            Düzenle
          </Link>
          <Link 
            href={`/admin/categories/new?parent=${category.id}`} 
            className="text-sm px-3 py-1.5 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition"
          >
            Alt Ekle
          </Link>
        </div>
      </div>
      
      {/* Children categories */}
      {hasChildren && isExpanded && (
        <div className={`mt-2 ml-4 border-l-2 border-gray-700 pl-2 py-2 ${level > 0 ? 'ml-8' : 'ml-4'}`}>
          {renderChildren()}
        </div>
      )}
    </li>
  );
};

export default DraggableCategoryItem; 