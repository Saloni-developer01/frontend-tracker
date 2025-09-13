import { useMemo, useState } from "react";
import { FinancialRecord, useFinancialRecords } from "../../contexts/financial-record-context"
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  CellContext,
  ColumnDef,
} from "@tanstack/react-table";
import { FinancialChart } from "./FinancialChart"; 
import { SignedIn } from "@clerk/clerk-react";


const EditableCell = ({ getValue, row, column, table }) => {
  const initialValue = getValue();
  const [value, setValue] = useState(initialValue);
  const [isEditing, setIsEditing] = useState(false);
  const { updateRecord, editable } = column.columnDef.meta;

  const handleBlur = () => {
    setIsEditing(false);
    updateRecord(row.index, column.id, value);
  };

  return (
    <div onClick={() => editable && setIsEditing(true)} style={{cursor: editable? "pointer" : "default"}}>
      {isEditing ? (
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={handleBlur}
          autoFocus
          style={{ width: "100%" }}
        />
      ) : (
        typeof value === "string" ? value : String(value)
      )}
    </div>
  );
};

export const FinancialRecordList = () => {
  const { records, updateRecord, deleteRecord } = useFinancialRecords();

  const [categoryFilter, setCategoryFilter] = useState("");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("");

  const [monthFilter, setMonthFilter] = useState<string>("");
  const [yearFilter, setYearFilter] = useState<string>("");

  const updateCellRecord = (rowIndex: number, columnId: string, value: any) => {
    const id = records[rowIndex]?._id;
    updateRecord(id ?? "", {...records[rowIndex], [columnId] : value});
  }



  const filteredRecords : FinancialRecord[] = useMemo(() => {
    if (!records) return []; 
    return records.filter(record => {
      const recordDate = new Date(record.date);
      const recordMonth = recordDate.toLocaleString("default", { month: "long" });
      const recordYear = recordDate.getFullYear().toString();

      const categoryMatch = categoryFilter === "" || record.category === categoryFilter;
      const paymentMethodMatch = paymentMethodFilter === "" || record.paymentMethod === paymentMethodFilter;
      const monthMatch = monthFilter === "" || recordMonth === monthFilter;
      const yearMatch = yearFilter === "" || recordYear === yearFilter;
      return categoryMatch && paymentMethodMatch && monthMatch && yearMatch;
    });
  }, [records, categoryFilter, paymentMethodFilter, monthFilter, yearFilter]);


  const uniqueMonths = useMemo(() => {
      const allMonths = records.map(record => new Date(record.date).toLocaleString("default", { month: "long" }));
      return Array.from(new Set(allMonths));
  }, [records]);
  
  const uniqueYears = useMemo(() => {
      const allYears = records.map(record => new Date(record.date).getFullYear().toString());
      return Array.from(new Set(allYears));
  }, [records]);


  const columns : ColumnDef<FinancialRecord>[] = useMemo(() => {
    
     const getUpdateRecord = () => updateCellRecord;

    return [
      {
        header: "Title",
        accessorKey: "title",
        cell: (props: CellContext<FinancialRecord, any>) => <EditableCell {...props} />,
        meta: {
          updateRecord: getUpdateRecord(),
          editable: true,
        },

      },
      {
        header: "Amount",
        accessorKey: "amount",
        cell: (props) => <EditableCell {...props} />,
        meta: {
          updateRecord: getUpdateRecord(),
          editable: true,
        },
      },
      {
        header: "Category",
        accessorKey: "category",
        cell: (props) => <EditableCell {...props} />,
        meta: {
          updateRecord: getUpdateRecord(),
          editable: true,
        },
      },
      {
        header: "Payment Method",
        accessorKey: "paymentMethod",
        cell: (props) => <EditableCell {...props} />,
        meta: {
          updateRecord: getUpdateRecord(),
          editable: true,
        },
      },
      {
        header: "Date",
        accessorKey: "date",
        cell: ({ getValue }) => {
          const dateString = getValue() as string;
          const date = new Date(dateString);
          return date.toLocaleDateString("en-GB"); 
        },
        meta: {
          updateRecord: getUpdateRecord(),
          editable: false, // Date field is not editable
        },
      },
    
      {
      header: "Delete",
      id: "delete-column",
      cell: ({ row }: CellContext<FinancialRecord, any>) => (
        <button onClick={() => deleteRecord(row.original._id ?? "")} className="button">
          Delete
        </button>
      ),
    },
  
    ];
  }, [records, deleteRecord, updateCellRecord]);

  const table = useReactTable({
    columns,
    data: filteredRecords,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
     <SignedIn>
    <div className="table-container">
     
      <FinancialChart /> 

      <div className="filter-section">
        <label>Filter by Category:</label>
        <select onChange={(e) => setCategoryFilter(e.target.value)} value={categoryFilter} className="dropdown-select">
          <option value="">All</option>
          {Array.from(new Set(records.map(record => record.category))).map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
        
        <label>Filter by Payment Method:</label>
        <select onChange={(e) => setPaymentMethodFilter(e.target.value)} value={paymentMethodFilter} className="dropdown-select">
          <option value="">All</option>
          {Array.from(new Set(records.map(record => record.paymentMethod))).map(method => (
            <option key={method} value={method}>{method}</option>
          ))}
        </select>

        <label>Filter by Month:</label>
        <select onChange={(e) => setMonthFilter(e.target.value)} value={monthFilter} className="dropdown-select">
          <option value="">All</option>
          {uniqueMonths.map(month => (
              <option key={month} value={month}>{month}</option>
          ))}
        </select>
        
        <label>Filter by Year:</label>
        <select onChange={(e) => setYearFilter(e.target.value)} value={yearFilter} className="dropdown-select">
          <option value="">All</option>
          {uniqueYears.map(year => (
              <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>

      {filteredRecords.length === 0 ? (
        <div className="no-records-message" style={{ textAlign: "center", marginTop: "20px", fontSize: "1.2rem", color: "#666" }}>
          No records found matching the selected filters. 😔
        </div>
      ) : (

       
        <>
    <div style={{ textAlign: 'center', marginTop: '6rem', fontSize:"0.9rem", color:"grey" }}>
      **Hint:** To edit any record, simply **double-click** the field. After making changes, click anywhere else on the screen to save.
    </div>
        
      <table className="table">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id} colSpan={header.colSpan}>
                  {header.isPlaceholder
                    ? null
                    : (
                      <div>
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                      </div>
                    )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
       </>
      )}
    </div>
    </SignedIn>
 
  );
};