import React, { useState } from 'react';
import { Check, Edit, Trash2, Save, X } from 'lucide-react';
import { ListItem as ListItemType } from '../../types';
import { shoppingListService } from '../../services/api';

interface ListItemProps {
  item: ListItemType;
  listId: number;
  onUpdate: () => void;
}

const ListItem: React.FC<ListItemProps> = ({ item, listId, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedItem, setEditedItem] = useState(item);

  const handleToggle = async () => {
    const isPurchased = !item.is_purchased;
    try {
      await shoppingListService.updateItem(listId, item.id, { is_purchased: isPurchased });
      onUpdate();
    } catch (error) {
      console.error('Error updating item:', error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      try {
        await shoppingListService.deleteItem(listId, item.id);
        onUpdate();
      } catch (error) {
        console.error('Error deleting item:', error);
      }
    }
  };

  const handleUpdate = async () => {
    try {
      await shoppingListService.updateItem(listId, item.id, {
        quantity: editedItem.quantity,
        notes: editedItem.notes,
      });
      setIsEditing(false);
      onUpdate();
    } catch (error) {
      console.error('Error updating item:', error);
    }
  };

  return (
    <div
      className={`flex items-center justify-between p-4 rounded-lg transition-colors duration-200 ${
        item.is_purchased ? 'bg-green-50 text-gray-500' : 'bg-white shadow-sm'
      }`}
    >
      <div className="flex items-center flex-grow">
        <button
          onClick={handleToggle}
          className={`mr-4 p-1 rounded-full border-2 transition-colors duration-200 ${
            item.is_purchased
              ? 'bg-green-500 border-green-500 text-white'
              : 'border-gray-300 hover:border-green-500'
          }`}
        >
          <Check className="h-4 w-4" />
        </button>
        
        {isEditing ? (
          <div className="flex-grow">
            <input 
              type="number"
              value={editedItem.quantity}
              onChange={(e) => setEditedItem({...editedItem, quantity: parseFloat(e.target.value)})}
              className="input input-sm w-20 mr-2"
            />
            <input 
              type="text"
              value={editedItem.notes || ''}
              onChange={(e) => setEditedItem({...editedItem, notes: e.target.value})}
              className="input input-sm"
              placeholder="Notas"
            />
          </div>
        ) : (
          <div className="flex-grow">
            <div className="flex items-center space-x-2 mb-1">
              <span className={`font-medium ${item.is_purchased ? 'line-through' : 'text-gray-800'}`}>
                {item.product_name || item.custom_product_name}
              </span>
              {/* Badge de categoría */}
              {item.category_name && (
                <span 
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700"
                  style={{
                    backgroundColor: item.category_color ? `${item.category_color}20` : '#f3f4f6',
                    color: item.category_color || '#374151'
                  }}
                >
                  {item.category_icon && <span className="mr-1">{item.category_icon}</span>}
                  {item.category_name}
                </span>
              )}
            </div>
            <div className="text-sm text-gray-500">
              x{item.quantity} {item.unit}
              {item.estimated_price && ` • ${(item.estimated_price * item.quantity).toFixed(2)}€`}
            </div>
            {item.notes && <p className="text-sm text-gray-500 mt-1">{item.notes}</p>}
          </div>
        )}
      </div>

      <div className="flex items-center space-x-2">
        {isEditing ? (
          <>
            <button onClick={handleUpdate} className="btn btn-primary btn-sm">
              <Save className="h-4 w-4" />
            </button>
            <button onClick={() => setIsEditing(false)} className="btn btn-secondary btn-sm">
              <X className="h-4 w-4" />
            </button>
          </>
        ) : (
          <>
            <span className="text-sm font-semibold text-gray-700">
              {item.estimated_price ? `${(item.estimated_price * item.quantity).toFixed(2)}€` : ''}
            </span>
            <button onClick={() => setIsEditing(true)} className="btn btn-secondary btn-sm">
              <Edit className="h-4 w-4" />
            </button>
            <button onClick={handleDelete} className="btn btn-danger btn-sm">
              <Trash2 className="h-4 w-4" />
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ListItem; 