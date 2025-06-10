// Demo data setup script for testing the application
console.log("Setting up demo transaction data...")

const demoTransactions = [
  {
    id: "demo_1",
    buyer: "Rajesh Kumar",
    seller: "Priya Devi",
    houseNo: "45/2",
    surveyNo: "123/4A",
    documentNo: "REG2024001",
    date: "15/03/2024",
    value: "₹12,50,000",
    originalBuyer: "ராஜேஷ் குமார்",
    originalSeller: "பிரியா தேவி",
    demoData: true,
  },
  {
    id: "demo_2",
    buyer: "Meera Shankar",
    seller: "Venkatesh Iyer",
    houseNo: "78/1",
    surveyNo: "456/2B",
    documentNo: "REG2024002",
    date: "22/03/2024",
    value: "₹8,75,000",
    originalBuyer: "மீரா சங்கர்",
    originalSeller: "வெங்கடேஷ் ஐயர்",
    demoData: true,
  },
  {
    id: "demo_3",
    buyer: "Arjun Reddy",
    seller: "Lakshmi Narayanan",
    houseNo: "12/3",
    surveyNo: "789/1C",
    documentNo: "REG2024003",
    date: "28/03/2024",
    value: "₹15,25,000",
    originalBuyer: "அர்ஜுன் ரெட்டி",
    originalSeller: "லக்ஷ்மி நாராயணன்",
    demoData: true,
  },
]

// This would typically be stored in localStorage by the application
console.log("Demo transactions created:")
console.log(JSON.stringify(demoTransactions, null, 2))

console.log("\nTo use this demo data:")
console.log("1. Open the application in your browser")
console.log("2. Login with admin/password")
console.log("3. Run this script in the browser console to add demo data")
console.log("4. Or upload a PDF to extract real transactions")

console.log("\nDemo data setup complete!")
