const express = require("express");
const cors = require("cors");
const ExcelJS = require("exceljs");
const fs = require("fs");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const FILE_NAME = "Registrations.xlsx";

async function saveRegistration(data) {

    const workbook = new ExcelJS.Workbook();
    let worksheet;

    if (fs.existsSync(FILE_NAME)) {
        await workbook.xlsx.readFile(FILE_NAME);
        worksheet = workbook.getWorksheet("Registrations");
    } else {
        worksheet = workbook.addWorksheet("Registrations");

       worksheet.columns = [
    { header: "Registration ID", key: "id", width: 20 },
    { header: "Timestamp", key: "time", width: 25 },

    { header: "Team Name", key: "teamName", width: 30 },
    { header: "Number of Members", key: "teamSize", width: 20 },

    { header: "College", key: "college", width: 35 },

    { header: "Member 1 Name", key: "member1", width: 25 },
    { header: "Member 1 Phone", key: "phone1", width: 20 },
    { header: "Member 1 Year", key: "year1", width: 15 },
    { header: "Member 1 Department", key: "dept1", width: 20 },

    { header: "Member 2 Name", key: "member2", width: 25 },
    { header: "Member 2 Phone", key: "phone2", width: 20 },
    { header: "Member 2 Year", key: "year2", width: 15 },
    { header: "Member 2 Department", key: "dept2", width: 20 },

    { header: "Member 3 Name", key: "member3", width: 25 },
    { header: "Member 3 Phone", key: "phone3", width: 20 },
    { header: "Member 3 Year", key: "year3", width: 15 },
    { header: "Member 3 Department", key: "dept3", width: 20 },

    { header: "Track", key: "track", width: 25 }
];
    }

    const rowCount = worksheet.rowCount;
    const regId = "DS2026-" + String(rowCount).padStart(4, "0");

    worksheet.addRow({
    id: regId,
    time: new Date().toLocaleString(),

    teamName: data.teamName,
    teamSize: data.teamSize,
    college: data.college,

    member1: data.member1,
    phone1: data.phone1,
    year1: data.year1,
    dept1: data.dept1,

    member2: data.member2,
    phone2: data.phone2,
    year2: data.year2,
    dept2: data.dept2,

    member3: data.member3,
    phone3: data.phone3,
    year3: data.year3,
    dept3: data.dept3,

    track: data.track
});

    await workbook.xlsx.writeFile(FILE_NAME);
}

app.post("/api/register", async (req, res) => {

    try {

        await saveRegistration(req.body);

        res.json({
            success: true
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            success: false,
            message: err.message
        });

    }

});

app.use(express.static(__dirname));

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});