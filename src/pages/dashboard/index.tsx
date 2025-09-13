import { SignedIn, useUser } from "@clerk/clerk-react"
import { FinancialRecordForm } from "./financial-record-form";
import { FinancialRecordList } from "./financial-record-list";
import "./financial-record.css";
import { useFinancialRecords } from "../../contexts/financial-record-context";
import { useMemo } from "react";


export const Dashboard = () => {
    const {user} = useUser();
    const {records} = useFinancialRecords();

    const totalMonthly = useMemo(() => {
        let totalAmount = 0;
        if (records && Array.isArray(records)) {
        records.forEach((record) => {
            totalAmount += record.amount
        });
        }else{
            return <div>No financial records found.</div>;
        }

        return totalAmount;
    }, [records])



    return (
    <div className="dashboard-container">
        <h1>Welcome {user?.firstName}! Here Are Your Finances:</h1>
        <FinancialRecordForm/>
        <SignedIn>
        <div style={{marginTop:"2rem", fontSize:"1.1rem", fontWeight:"bold"}}>
        <div>Total Monthly: &#8377;{totalMonthly}</div>
        </div>
        </SignedIn>
        <FinancialRecordList/>
    </div>
    )
}