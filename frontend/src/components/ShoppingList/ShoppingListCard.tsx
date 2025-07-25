import React from 'react';
import { Calendar, CheckCircle2, Clock, Euro, Trash2, Edit } from 'lucide-react';
import { ShoppingList } from '../../types';

interface ShoppingListCardProps {
  list: ShoppingList;
  onEdit?: (list: ShoppingList) => void;
  onDelete?: (list: ShoppingList) => void;
  onClick?: (list: ShoppingList) => void;
}

const ShoppingListCard: React.FC<ShoppingListCardProps> = ({
  list,
  onEdit,
  onDelete,
  onClick,
}) => {
  const progress = list.total_items ? (list.purchased_items || 0) / list.total_items * 100 : 0;
  const isCompleted = list.is_completed;

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(list);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(list);
  };

  const handleClick = () => {
    onClick?.(list);
  };

  return (
    <div
      className={`card cursor-pointer hover:shadow-md transition-all duration-200 ${
        isCompleted ? 'bg-success-50 border-success-200' : ''
      }`}
      onClick={handleClick}
    >
      <div className="card-header pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className={`card-title text-lg ${isCompleted ? 'text-success-700' : ''}`}>
              {list.name}
              {isCompleted && (
                <CheckCircle2 className="inline-block ml-2 h-5 w-5 text-success-500" />
              )}
            </h3>
            {list.description && (
              <p className="card-description mt-1">{list.description}</p>
            )}
          </div>
          
          <div className="flex items-center space-x-1 ml-4">
            {onEdit && (
              <button
                onClick={handleEdit}
                className="btn btn-secondary btn-sm"
                aria-label="Editar lista"
              >
                <Edit className="h-4 w-4" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={handleDelete}
                className="btn btn-danger btn-sm"
                aria-label="Eliminar lista"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="card-content">
        {/* Barra de progreso */}
        {list.total_items && list.total_items > 0 && (
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">
                {list.purchased_items || 0} de {list.total_items} elementos
              </span>
              <span className="text-gray-600">{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  isCompleted ? 'bg-success-500' : 'bg-primary-500'
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Estadísticas */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center space-x-2 text-gray-600">
            <Clock className="h-4 w-4" />
            <span>
              {isCompleted
                ? `Completada ${new Date(list.completed_at || '').toLocaleDateString()}`
                : `Creada ${new Date(list.created_at).toLocaleDateString()}`
              }
            </span>
          </div>
          
          {list.estimated_total !== undefined && list.estimated_total > 0 && (
            <div className="flex items-center space-x-2 text-gray-600">
              <Euro className="h-4 w-4" />
              <span>{Number(list.estimated_total).toFixed(2)}€</span>
            </div>
          )}
        </div>

        {/* Presupuesto */}
        {list.total_budget && (
          <div className="mt-3 p-2 bg-gray-50 rounded-md">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Presupuesto:</span>
              <span className="font-medium">{Number(list.total_budget).toFixed(2)}€</span>
            </div>
            {list.estimated_total && (
              <div className="flex justify-between text-sm mt-1">
                <span className="text-gray-600">Restante:</span>
                <span className={`font-medium ${
                  Number(list.total_budget) - Number(list.estimated_total) >= 0
                    ? 'text-success-600'
                    : 'text-error-600'
                }`}>
                  {(Number(list.total_budget) - Number(list.estimated_total)).toFixed(2)}€
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {list.total_items === 0 && (
        <div className="card-footer">
          <p className="text-gray-500 text-sm">Lista vacía - haz clic para agregar elementos</p>
        </div>
      )}
    </div>
  );
};

export default ShoppingListCard; 