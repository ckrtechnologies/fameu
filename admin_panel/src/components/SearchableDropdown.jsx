import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Search } from 'lucide-react';

export default function SearchableDropdown({ 
  options = [], 
  value, 
  onChange, 
  placeholder = 'Select option',
  allLabel = 'All' 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const sortedOptions = useMemo(() => {
    return [...options].sort((a, b) => String(a).localeCompare(String(b)));
  }, [options]);

  const filteredOptions = useMemo(() => {
    return sortedOptions.filter(opt => 
      String(opt).toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [sortedOptions, searchTerm]);

  const handleSelect = (val) => {
    onChange(val);
    setIsOpen(false);
    setSearchTerm('');
  };

  const displayValue = value && value !== 'all' ? value : allLabel;

  return (
    <div className="custom-dropdown-container" ref={dropdownRef}>
      <button 
        className="custom-dropdown-button input-field" 
        onClick={() => setIsOpen(!isOpen)}
        type="button"
      >
        <span style={{ textTransform: 'capitalize' }}>{displayValue}</span>
        <ChevronDown size={16} color="var(--text-secondary)" />
      </button>

      {isOpen && (
        <div className="custom-dropdown-menu">
          <div className="custom-dropdown-search">
            <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="custom-dropdown-list">
            <div 
              className={`custom-dropdown-item ${value === 'all' ? 'selected' : ''}`}
              onClick={() => handleSelect('all')}
            >
              {allLabel}
            </div>
            
            {filteredOptions.length === 0 ? (
              <div className="custom-dropdown-empty">No options found</div>
            ) : (
              filteredOptions.map((opt) => (
                <div 
                  key={opt}
                  className={`custom-dropdown-item ${value === opt ? 'selected' : ''}`}
                  onClick={() => handleSelect(opt)}
                >
                  <span style={{ textTransform: 'capitalize' }}>{opt}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
