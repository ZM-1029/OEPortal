import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ManageColumnStateService {
  private _allColumns = signal<any[]>([]);
  private _displayedColumns = signal<any[]>([]);
  private readonly STORAGE_KEY = 'agGrid_columnState';

  constructor() {
    this._loadState(); // Load saved state on initialization
  }
  // Save state to localStorage
  private _saveState() {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this._displayedColumns()));
  }
  // Load state from localStorage
  private _loadState() {
    const savedState = localStorage.getItem(this.STORAGE_KEY);
    if (savedState) {
      this._displayedColumns.set(JSON.parse(savedState));
    }
  }
  // Public methods
  setAllColumns(columns: any[]) {
    this._allColumns.set(columns);
    if (this._displayedColumns().length === 0) {
      this._displayedColumns.set([...columns]); 
    }
    this._saveState();
  }

  setDisplayedColumns(columns: any[]) {
    this._displayedColumns.set(columns);
    this._saveState();
  }

  getAllColumns() {
    return this._allColumns();
  }

  getDisplayedColumns() {
    return this._displayedColumns();
  }

  toggleColumn(column: any) {
    const current = this._displayedColumns();
    const index = current.findIndex((col) => col.field === column.field);
    if (index >= 0) {
      this._displayedColumns.set([...current.slice(0, index), ...current.slice(index + 1)]);
    } else {
      const all = this._allColumns();
      const colToAdd = all.find((col) => col.field === column.field);
      if (colToAdd) {
        this._displayedColumns.set([...current, colToAdd]);
      }
    }
    this._saveState();
  }

  isColumnDisplayed(column: any): boolean {
    return this._displayedColumns().some((col) => col.field === column.field);
  }
}