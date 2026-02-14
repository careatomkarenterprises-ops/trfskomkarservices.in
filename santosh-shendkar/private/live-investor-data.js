// LIVE INVESTOR DATA - FETCHED FROM GOOGLE SHEETS
// This updates AUTOMATICALLY when you change your Excel!

async function loadInvestorData() {
    try {
        // 🔴 REPLACE THIS URL WITH YOUR PUBLISHED GOOGLE SHEET CSV URL
        const GOOGLE_SHEET_URL = 'https://docs.google.com/spreadsheets/d/13Qipv1_Kk5r3zJ64GurpNf-0OCmKKCyiZk80bja9vbQ/pub?output=csv';
        
        const response = await fetch(GOOGLE_SHEET_URL);
        const csvData = await response.text();
        
        // Parse CSV and convert to investor database
        const investors = parseInvestorCSV(csvData);
        return investors;
    } catch (error) {
        console.error('Failed to load investor data:', error);
        return null;
    }
}

function parseInvestorCSV(csv) {
    const lines = csv.split('\n');
    const headers = lines[0].split(',');
    
    let investorData = {};
    
    // Loop through each row (skip header)
    for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        
        const row = lines[i].split(',');
        
        // 🔴 MAP YOUR EXCEL COLUMNS TO INVESTOR FIELDS
        const investor = {
            name: row[2]?.trim() || '',           // Column C: agreement name
            mobile: formatMobile(row[1]),           // Column B: date of investment (you'll need mobile column!)
            principal: parseFloat(row[3]) || 0,     // Column D: amount of investment
            rate: parseFloat(row[7]) || 0,          // Column H: RoI
            date: row[1]?.trim() || '',            // Column B: date
            repaymentDate: row[4]?.trim() || '',   // Column E: repayment dates
            repaymentAmount: parseFloat(row[5]) || 0 // Column F: repayment amount
        };
        
        // Group by mobile number (YOU NEED TO ADD MOBILE COLUMN TO EXCEL!)
        if (investor.mobile) {
            if (!investorData[investor.mobile]) {
                investorData[investor.mobile] = {
                    name: investor.name,
                    mobile: investor.mobile,
                    investments: [],
                    totalPrincipal: 0,
                    paymentHistory: []
                };
            }
            
            investorData[investor.mobile].investments.push({
                id: `INV${i}`,
                date: investor.date,
                principal: investor.principal,
                rate: investor.rate,
                tenure: 12,
                maturityDate: calculateMaturity(investor.date)
            });
            
            investorData[investor.mobile].totalPrincipal += investor.principal;
            
            // Add to payment history if repayment exists
            if (investor.repaymentAmount > 0) {
                investorData[investor.mobile].paymentHistory.push({
                    date: investor.repaymentDate,
                    amount: investor.repaymentAmount,
                    type: 'Interest'
                });
            }
        }
    }
    
    return investorData;
}

function formatMobile(str) {
    // Extract only digits
    const digits = str.replace(/[^0-9]/g, '');
    // Return 10-digit mobile if valid
    return digits.length === 10 ? digits : null;
}

function calculateMaturity(dateStr) {
    // Add 12 months to investment date
    const date = new Date(dateStr);
    date.setMonth(date.getMonth() + 12);
    return date.toLocaleDateString('en-IN');
}