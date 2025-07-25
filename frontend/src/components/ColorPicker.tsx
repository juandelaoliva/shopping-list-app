import React from 'react';

// Colores predefinidos para supermercados
const PREDEFINED_COLORS = [
  '#FF6B35', // Naranja vibrante (Mercadona)
  '#0066CC', // Azul corporativo (Carrefour)
  '#FFD100', // Amarillo brillante (Lidl)
  '#E30613', // Rojo corporativo (Dia)
  '#00A651', // Verde corporativo (Alcampo)
  '#6366F1', // Índigo (Default)
  '#8B5CF6', // Púrpura
  '#06B6D4', // Cian
  '#10B981', // Esmeralda
  '#F59E0B', // Ámbar
  '#EF4444', // Rojo
  '#3B82F6', // Azul
  '#F97316', // Naranja
  '#84CC16', // Lima
  '#EC4899', // Rosa
  '#64748B', // Gris azulado
];

// Función para calcular contraste y determinar color de texto
export const getContrastTextColor = (backgroundColor: string | null | undefined): string => {
  // Si no hay color, usar el color por defecto
  if (!backgroundColor) {
    backgroundColor = '#6366F1';
  }
  
  // Remover el # si está presente
  const hex = backgroundColor.replace('#', '');
  
  // Verificar que el formato sea válido
  if (!/^[A-Fa-f0-9]{6}$/.test(hex) && !/^[A-Fa-f0-9]{3}$/.test(hex)) {
    // Si el formato no es válido, usar color por defecto
    return getContrastTextColor('#6366F1');
  }
  
  // Normalizar a formato de 6 caracteres si es de 3
  const normalizedHex = hex.length === 3 
    ? hex.split('').map(char => char + char).join('')
    : hex;
  
  // Convertir a RGB
  const r = parseInt(normalizedHex.substr(0, 2), 16);
  const g = parseInt(normalizedHex.substr(2, 2), 16);
  const b = parseInt(normalizedHex.substr(4, 2), 16);
  
  // Calcular luminosidad relativa usando la fórmula W3C
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Retornar blanco para colores oscuros, negro para colores claros
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
};

// Función para validar si un color hex es válido
const isValidHexColor = (color: string): boolean => {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
};

interface ColorPickerProps {
  selectedColor: string;
  onColorChange: (color: string) => void;
  label?: string;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ 
  selectedColor, 
  onColorChange, 
  label = "Color" 
}) => {
  const [customColor, setCustomColor] = React.useState(selectedColor);
  const [showCustomPicker, setShowCustomPicker] = React.useState(false);

  // Verificar si el color actual está en los predefinidos
  // const isPresetColor = PREDEFINED_COLORS.includes(selectedColor.toUpperCase());

  const handlePresetColorClick = (color: string) => {
    setCustomColor(color);
    onColorChange(color);
    setShowCustomPicker(false);
  };

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    setCustomColor(newColor);
    
    if (isValidHexColor(newColor)) {
      onColorChange(newColor);
    }
  };

  const handleCustomColorBlur = () => {
    if (!isValidHexColor(customColor)) {
      // Si el color no es válido, revertir al color seleccionado actual
      setCustomColor(selectedColor);
    }
  };

  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      
      {/* Preview del color seleccionado */}
      <div className="flex items-center gap-3 mb-3">
        <div 
          className="w-12 h-12 rounded-lg border-2 border-slate-200 flex items-center justify-center font-medium text-sm"
          style={{ 
            backgroundColor: selectedColor,
            color: getContrastTextColor(selectedColor)
          }}
        >
          Aa
        </div>
        <div>
          <div className="text-sm font-medium text-slate-900">Color seleccionado</div>
          <div className="text-xs text-slate-500">{selectedColor.toUpperCase()}</div>
        </div>
      </div>

      {/* Colores predefinidos */}
      <div className="mb-4">
        <div className="text-sm font-medium text-slate-700 mb-2">Colores predefinidos</div>
        <div className="grid grid-cols-8 gap-2">
          {PREDEFINED_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => handlePresetColorClick(color)}
              className={`w-8 h-8 rounded-lg border-2 transition-all duration-200 hover:scale-110 ${
                selectedColor.toUpperCase() === color.toUpperCase()
                  ? 'border-slate-900 shadow-lg ring-2 ring-slate-900 ring-opacity-20'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
      </div>

      {/* Selector personalizado */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm font-medium text-slate-700">Color personalizado</div>
          <button
            type="button"
            onClick={() => setShowCustomPicker(!showCustomPicker)}
            className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
          >
            {showCustomPicker ? 'Ocultar' : 'Mostrar'} selector
          </button>
        </div>
        
        {showCustomPicker && (
          <div className="space-y-3">
            {/* Input de texto para hex */}
            <div className="flex gap-2">
              <input
                type="text"
                value={customColor}
                onChange={handleCustomColorChange}
                onBlur={handleCustomColorBlur}
                placeholder="#FF6B35"
                className={`form-input flex-1 font-mono text-sm ${
                  !isValidHexColor(customColor) ? 'border-red-300 bg-red-50' : ''
                }`}
                maxLength={7}
              />
              <input
                type="color"
                value={isValidHexColor(customColor) ? customColor : '#6366F1'}
                onChange={(e) => {
                  const newColor = e.target.value;
                  setCustomColor(newColor);
                  onColorChange(newColor);
                }}
                className="w-12 h-10 rounded border border-slate-200 cursor-pointer"
                title="Selector de color visual"
              />
            </div>
            
            {!isValidHexColor(customColor) && (
              <div className="text-xs text-red-600">
                Formato de color inválido. Use formato hexadecimal (#RRGGBB)
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ColorPicker; 