import React, { useState, useMemo } from 'react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { Search, Download, FileText, Eye, Edit, Trash2 } from 'lucide-react';
import { subDays, isBefore, parseISO, startOfDay } from 'date-fns';
import SearchableDropdown from './SearchableDropdown';

export default function DataTable({ 
  columns, 
  data = [], 
  title, 
  subtitle, 
  filterConfig = {}, 
  onView, 
  onEdit, 
  onDelete,
  headerAction
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState({});
  const [dateRange, setDateRange] = useState('all');

  const filterKeys = Object.keys(filterConfig);

  const handleFilterChange = (key, value) => {
    setActiveFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const filteredData = useMemo(() => {
    return data.filter(row => {
      if (searchTerm) {
        const searchMatch = Object.values(row).some(val => 
          String(val).toLowerCase().includes(searchTerm.toLowerCase())
        );
        if (!searchMatch) return false;
      }

      for (const key of filterKeys) {
        if (activeFilters[key] && activeFilters[key] !== 'all') {
          if (String(row[key]).toLowerCase() !== String(activeFilters[key]).toLowerCase()) {
            return false;
          }
        }
      }

      if (dateRange !== 'all') {
        const rowDateStr = row.created_at || row.date;
        if (rowDateStr) {
          const rowDate = parseISO(rowDateStr);
          const now = new Date();
          let startDate;
          
          if (dateRange === 'today') {
            startDate = startOfDay(now);
          } else if (dateRange === '7days') {
            startDate = subDays(now, 7);
          } else if (dateRange === '30days') {
            startDate = subDays(now, 30);
          }

          if (isBefore(rowDate, startDate)) {
            return false;
          }
        }
      }

      return true;
    });
  }, [data, searchTerm, activeFilters, dateRange, filterKeys]);

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

        <SearchableDropdown 
          options={['today', '7days', '30days']}
          value={dateRange}
          onChange={setDateRange}
          placeholder="Filter by date"
          allLabel="All Time"
        />

        {filterKeys.map(key => (
          <SearchableDropdown
            key={key}
            options={filterConfig[key]}
            value={activeFilters[key] || 'all'}
            onChange={(val) => handleFilterChange(key, val)}
            placeholder={`Filter by ${key}`}
            allLabel={`All ${key}`}
          />
        ))}
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

                  {(onView || onEdit || onDelete) && (
                    <td style={{ padding: '16px', textAlign: 'right' }}>
                      {onView && (
                        <button className="btn btn-secondary" style={{ padding: '6px', marginRight: '8px' }} onClick={() => onView(row)} title="View">
                          <Eye size={16} />
                        </button>
                      )}
                      {onEdit && (
                        <button className="btn btn-primary" style={{ padding: '6px', marginRight: '8px' }} onClick={() => onEdit(row)} title="Edit">
                          <Edit size={16} />
                        </button>
                      )}
                      {onDelete && (
                        <button className="btn btn-danger" style={{ padding: '6px' }} onClick={() => onDelete(row)} title="Delete">
                          <Trash2 size={16} />
                        </button>
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
