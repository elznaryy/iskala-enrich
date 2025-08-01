import Papa from 'papaparse';
import * as XLSX from 'xlsx';

export interface ParsedRow {
  [key: string]: string;
}

export interface FileParseResult {
  headers: string[];
  rows: ParsedRow[];
  fileName: string;
  sheetName?: string;
}

export function parseCSV(file: File): Promise<FileParseResult> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          reject(new Error(`CSV parsing error: ${results.errors[0].message}`));
          return;
        }
        
        const headers = results.meta.fields || [];
        const rows = results.data as ParsedRow[];
        
        resolve({
          headers,
          rows,
          fileName: file.name
        });
      },
      error: (error) => {
        reject(new Error(`CSV parsing error: ${error.message}`));
      }
    });
  });
}

export function parseXLSX(file: File): Promise<FileParseResult[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        const results: FileParseResult[] = [];
        
        workbook.SheetNames.forEach(sheetName => {
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          
          if (jsonData.length === 0) return;
          
          const headers = jsonData[0] as string[];
          const rows: ParsedRow[] = [];
          
          for (let i = 1; i < jsonData.length; i++) {
            const row = jsonData[i] as any[];
            const rowObj: ParsedRow = {};
            
            headers.forEach((header, index) => {
              rowObj[header] = row[index]?.toString() || '';
            });
            
            rows.push(rowObj);
          }
          
          results.push({
            headers,
            rows,
            fileName: file.name,
            sheetName
          });
        });
        
        resolve(results);
      } catch (error) {
        reject(new Error(`XLSX parsing error: ${error}`));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsArrayBuffer(file);
  });
}

export function parseFile(file: File): Promise<FileParseResult | FileParseResult[]> {
  const fileExtension = file.name.split('.').pop()?.toLowerCase();
  
  if (fileExtension === 'csv') {
    return parseCSV(file);
  } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
    return parseXLSX(file);
  } else {
    throw new Error('Unsupported file format. Please upload a CSV or XLSX file.');
  }
}

export function exportToCSV(data: any[], filename: string = 'enrichment-results.csv') {
  const csv = Papa.unparse(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
} 