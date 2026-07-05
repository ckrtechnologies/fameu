import React, { useState, useMemo } from 'react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { Search, Download, FileText, Eye, Edit, Trash2 } from 'lucide-react';
import { subDays, isBefore, isAfter, parseISO, startOfDay, endOfDay } from 'date-fns';
import SearchableDropdown from './SearchableDropdown';

export default function DataTable({ 
  columns, 
  data = [], 
  title, 
  subtitle, 
  filterConfig = {}, 
  dateFilterFields = [],
  onView, 
  onEdit, 
  onDelete,
  actions = [],
  headerAction
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState({});
  const [dateField, setDateField] = useState(dateFilterFields.length > 0 ? dateFilterFields[0].key : 'created_at');
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');

  const filterKeys = Object.keys(filterConfig);

  const handleFilterChange = (key, value) => {
    setActiveFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const filteredData = useMemo(() => {
    return data.filter(row => {
      // 1. Search term
      if (searchTerm) {
        const searchMatch = columns.some(col => {
          const val = row[col.key];
          return String(val || '').toLowerCase().includes(searchTerm.toLowerCase());
        });
        if (!searchMatch) return false;
      }

      // 2. Exact match filters
      for (const key of filterKeys) {
        if (activeFilters[key] && activeFilters[key] !== 'all') {
          if (String(row[key]).toLowerCase() !== String(activeFilters[key]).toLowerCase()) {
            return false;
          }
        }
      }

      // 3. Custom Date Range
      if (dateStart || dateEnd) {
        const rowDateStr = row[dateField];
        if (rowDateStr) {
          const rowDate = parseISO(rowDateStr);
          
          if (dateStart) {
            const startDate = startOfDay(parseISO(dateStart));
            if (isBefore(rowDate, startDate)) return false;
          }
          
          if (dateEnd) {
            const endDate = endOfDay(parseISO(dateEnd));
            if (isAfter(rowDate, endDate)) return false;
          }
        } else {
          return false; // If filtering by a date but row has no date, exclude it
        }
      }

      return true;
    });
  }, [data, searchTerm, activeFilters, dateStart, dateEnd, dateField, filterKeys]);

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text(title || 'Data Export', 14, 15);
    
    const tableColumns = ['S.No', ...columns.map(col => col.label)];
    const tableData = filteredData.map((row, index) => {
      return [
        index + 1,
        ...columns.map(col => {
          const val = row[col.key];
          return typeof val === 'object' ? JSON.stringify(val) : String(val || '');
        })
      ];
    });

    doc.autoTable({
      head: [tableColumns],
      body: tableData,
      startY: 20,
    });
    
    doc.save(`${title ? title.replace(/\s+/g, '_').toLowerCase() : 'export'}.pdf`);
  };

  const exportExcel = () => {
    const tableData = filteredData.map((row, index) => {
      const obj = { 'S.No': index + 1 };
      columns.forEach(col => {
        const val = row[col.key];
        obj[col.label] = typeof val === 'object' ? JSON.stringify(val) : String(val || '');
      });
      return obj;
    });

    const worksheet = XLSX.utils.json_to_sheet(tableData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
    
    XLSX.writeFile(workbook, `${title ? title.replace(/\s+/g, '_').toLowerCase() : 'export'}.xlsx`);
  };

  return (
    <div className="data-table-container animate-fade-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">{title}</h1>
          {subtitle && <p>{subtitle}</p>}
        </div>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          {headerAction && headerAction}
          <button className="btn btn-secondary" onClick={exportPDF} title="Export as PDF">
            <FileText size={16} /> PDF
          </button>
          <button className="btn btn-secondary" onClick={exportExcel} title="Export as Excel">
            <Download size={16} /> Excel
          </button>
        </div>
      </div>

      <div className="card" style={{ padding: '16px', marginBottom: '16px', display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div className="input-group" style={{ margin: 0, flex: '1', minWidth: '200px', display: 'flex', alignItems: 'center', background: 'var(--bg-dark)', padding: '0 12px', borderRadius: '8px' }}>
          <Search size={18} color="var(--text-secondary)" />
          <input 
            type="text" 
            placeholder="Search..." 
            style={{ border: 'none', background: 'transparent', padding: '10px', width: '100%', color: 'var(--text-primary)', outline: 'none' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {dateFilterFields.length > 0 && (
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            {dateFilterFields.length > 1 && (
              <select 
                value={dateField} 
                onChange={e => setDateField(e.target.value)}
                style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--bg-dark)', color: 'var(--text-primary)', outline: 'none' }}
              >
                {dateFilterFields.map(f => (
                  <option key={f.key} value={f.key}>{f.label}</option>
                ))}
              </select>
            )}
            <input 
              type="date" 
              style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--bg-dark)', color: 'var(--text-primary)', outline: 'none' }}
              value={dateStart}
              onChange={e => setDateStart(e.target.value)}
              title="Start Date"
            />
            <span style={{ color: 'var(--text-secondary)' }}>to</span>
            <input 
              type="date" 
              style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--bg-dark)', color: 'var(--text-primary)', outline: 'none' }}
              value={dateEnd}
              onChange={e => setDateEnd(e.target.value)}
              title="End Date"
            />
            {(dateStart || dateEnd) && (
              <button 
                onClick={() => { setDateStart(''); setDateEnd(''); }}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px 8px' }}
                title="Clear Dates"
              >
                Clear
              </button>
            )}
          </div>
        )}

        {filterKeys.map(key => {
          // Determine title for the label based on key if it's generic, else we can pass an object.
          // For simplicity, we just use the key.
          const formattedKey = key.replace('_', ' ');
          return (
            <SearchableDropdown
              key={key}
              options={filterConfig[key]}
              value={activeFilters[key] || 'all'}
              onChange={(val) => handleFilterChange(key, val)}
              placeholder={`Filter by ${formattedKey}`}
              allLabel={`All ${formattedKey}`}
            />
          );
        })}
      </div>

      <div className="card" style={{ padding: '0', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
          <thead style={{ background: 'var(--bg-dark)', borderBottom: '1px solid var(--border)' }}>
            <tr>
              <th style={{ padding: '16px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: '600', width: '60px' }}>S.No</th>
              {columns.map(col => (
                <th key={col.key} style={{ padding: '16px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: '600' }}>
                  {col.label}
                </th>
              ))}
              {(onView || onEdit || onDelete) && (
                <th style={{ padding: '16px', textAlign: 'right', color: 'var(--text-muted)', fontWeight: '600' }}>Actions</th>
              )}
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 2} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No records found.
                </td>
              </tr>
            ) : (
              filteredData.map((row, index) => (
                <tr key={row.id || index} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '16px', color: 'var(--text-muted)' }}>{index + 1}</td>
                  
                  {columns.map(col => (
                    <td key={col.key} style={{ padding: '16px' }}>
                      {col.render ? col.render(row[col.key], row) : (row[col.key] || '-')}
                    </td>
                  ))}

                  {(onView || onEdit || onDelete || actions?.length > 0) && (
                    <td style={{ padding: '16px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                      {(typeof actions === 'function' ? actions(row) : actions)?.length > 0 ? (
                        (typeof actions === 'function' ? actions(row) : actions).map((action, i) => (
                          <button 
                            key={i}
                            type="button"
                            className={`btn btn-${action.variant || 'secondary'}`} 
                            style={{ padding: '6px 10px', marginRight: i === (typeof actions === 'function' ? actions(row) : actions).length - 1 ? 0 : '8px', display: 'inline-flex', alignItems: 'center', gap: '6px' }} 
                            onClick={() => action.onClick(row)} 
                            title={action.label}
                          >
                            {action.icon && React.createElement(action.icon, { size: 14 })} {action.label}
                          </button>
                        ))
                      ) : (
                        <>
                          {onView && (
                            <button type="button" className="btn btn-secondary" style={{ padding: '6px 10px', marginRight: '8px', display: 'inline-flex', alignItems: 'center', gap: '6px' }} onClick={() => onView(row)} title="View">
                              <Eye size={14} /> View
                            </button>
                          )}
                          {onEdit && (
                            <button type="button" className="btn btn-primary" style={{ padding: '6px 10px', marginRight: '8px', display: 'inline-flex', alignItems: 'center', gap: '6px' }} onClick={() => onEdit(row)} title="Edit">
                              <Edit size={14} /> Edit
                            </button>
                          )}
                          {onDelete && (
                            <button type="button" className="btn btn-danger" style={{ padding: '6px 10px', display: 'inline-flex', alignItems: 'center', gap: '6px' }} onClick={() => onDelete(row)} title="Delete">
                              <Trash2 size={14} /> Delete
                            </button>
                          )}
                        </>
                      )}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
