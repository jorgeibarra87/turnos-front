import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, CircleXIcon } from 'lucide-react';

const SearchableDropdown = ({
    options = [],
    placeholder = "Buscar...",
    onSelect,
    onClear,
    value = "",
    displayProperty = "nombre",
    idProperty = "id",
    secondaryProperty = null,
    loading = false,
    error = null,
    className = "",
    disabled = false
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState(value);
    const [filteredOptions, setFilteredOptions] = useState(options);
    const containerRef = useRef(null);

    useEffect(() => {
        setSearchTerm(value);
    }, [value]);

    useEffect(() => {
        if (searchTerm === '') {
            setFilteredOptions(options);
        } else {
            const filtered = options.filter(option =>
                option[displayProperty]?.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredOptions(filtered);
        }
    }, [searchTerm, options, displayProperty]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleInputChange = (e) => {
        const newValue = e.target.value;
        setSearchTerm(newValue);
        setIsOpen(true);

        if (newValue === '' && onClear) {
            onClear();
        }
    };

    const handleOptionSelect = (option) => {
        const displayText = option[displayProperty];
        setSearchTerm(displayText);
        setIsOpen(false);

        if (onSelect) {
            onSelect(option);
        }
    };

    const handleClear = () => {
        setSearchTerm('');
        setIsOpen(false);
        if (onClear) {
            onClear();
        }
    };

    return (
        <div ref={containerRef} className={`relative w-full ${className}`}>
            {loading ? (
                <div className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50 text-center h-10">
                    <p className="text-gray-500 text-sm">Cargando...</p>
                </div>
            ) : error ? (
                <div className="w-full px-4 py-2 border border-red-300 rounded-md bg-red-50 h-10">
                    <p className="text-red-500 text-center text-sm">{error}</p>
                </div>
            ) : (
                <div className="relative">
                    {/* Input con búsqueda - mismo tamaño que select */}
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={handleInputChange}
                        onClick={() => !disabled && setIsOpen(true)}
                        placeholder={placeholder}
                        disabled={disabled}
                        className="w-full h-10 px-4 pr-12 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed box-border"
                        style={{
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            direction: 'ltr'
                        }}
                        title={searchTerm || placeholder}
                    />

                    {/* Iconos */}
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 gap-1 bg-white pointer-events-none">
                        {searchTerm && !disabled && (
                            <button
                                onClick={handleClear}
                                className="text-gray-400 hover:text-gray-600 p-1 pointer-events-auto"
                                type="button"
                            >
                                <CircleXIcon size={16} />
                            </button>
                        )}
                        <Search size={16} className="text-gray-400" />
                        <ChevronDown
                            size={16}
                            className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                        />
                    </div>

                    {/* Dropdown */}
                    {isOpen && !disabled && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                            {filteredOptions.length === 0 ? (
                                <div className="px-4 py-2 text-gray-500 text-center text-sm">
                                    {searchTerm ? 'No se encontraron resultados' : 'No hay opciones disponibles'}
                                </div>
                            ) : (
                                filteredOptions.map((option, index) => (
                                    <button
                                        key={option[idProperty] || index}
                                        onClick={() => handleOptionSelect(option)}
                                        className="w-full px-4 py-2 text-left hover:bg-blue-50 focus:bg-blue-50 focus:outline-none text-sm"
                                        title={`${option[displayProperty]}${secondaryProperty && option[secondaryProperty] ? ` - ${option[secondaryProperty]}` : ''}`}
                                    >
                                        <div className="truncate">
                                            {option[displayProperty]}
                                        </div>
                                        {secondaryProperty && option[secondaryProperty] && (
                                            <div className="text-xs text-gray-500 truncate">
                                                {option[secondaryProperty]}
                                            </div>
                                        )}
                                    </button>
                                ))
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SearchableDropdown;
