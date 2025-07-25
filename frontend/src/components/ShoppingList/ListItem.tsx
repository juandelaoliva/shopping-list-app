import React from 'react';
import { ListItem as ListItemType } from 'types';
import { Check, Edit, Trash2 } from 'lucide-react';
import { getContrastTextColor } from '../ColorPicker';

// Helper function para crear badges de supermercados con el color correcto
const createSupermarketBadge = (name: string, color?: string | null) => {
  const badgeColor = color || '#6366F1'; // Color por defecto
  const textColor = getContrastTextColor(badgeColor);
  
  return (
    <span 
      className="inline-block rounded-full font-medium px-2 py-1 text-xs"
      style={{
        backgroundColor: badgeColor,
        color: textColor
      }}
    >
      {name}
    </span>
  );
};

interface ListItemProps {
  item: ListItemType;
  onToggle: (item: ListItemType) => void;
  onEdit: (item: ListItemType) => void;
  onDelete: (itemId: number) => void;
}

const ListItem: React.FC<ListItemProps> = ({ item, onToggle, onEdit, onDelete }) => (
  <div className={`list-item ${item.is_purchased ? 'purchased' : ''}`}>
    <button className="checkbox-area" onClick={() => onToggle(item)}>
      <div className="checkbox">{item.is_purchased ? <Check size={16} /> : ''}</div>
    </button>
    <div className="item-details">
      <p className="item-name">{item.product_name}</p>
      <p className="item-meta">
        {item.supermarket_name && createSupermarketBadge(item.supermarket_name, item.supermarket_color)}
        {`${item.quantity} ${item.unit || 'unidad'}`}
        {item.estimated_price && ` - ${item.estimated_price}€`}
      </p>
    </div>
    <div className="item-actions">
      <button onClick={() => onEdit(item)}><Edit size={16} /></button>
      <button onClick={() => onDelete(item.id)}><Trash2 size={16} /></button>
    </div>
  </div>
);

export default ListItem;