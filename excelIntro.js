const excel = require('exceljs');

const workbook = new excel.Workbook();
workbook.creator = 'Me';
workbook.lastModifiedBy = 'Her';
workbook.created = new Date(1985, 8, 30);
workbook.modified = new Date();
workbook.lastPrinted = new Date(2016, 9, 27);
const sheet = workbook.addWorksheet('My Sheet');

sheet.columns = [
  { header: 'Id', key: 'id', width: 10 },
  { header: 'Name', key: 'name', width: 32 },
  { header: 'D.O.B.', key: 'DOB', width: 10, outlineLevel: 1 }
];

sheet.addRow({id: 1, name: 'John Doe', dob: new Date(1970,1,1).toDateString()});
sheet.addRow({id: 2, name: 'Jane Doe', dob: new Date(1965,1,7).toDateString()});

sheet.addRow([3, 'Sam', new Date().toDateString()]);
const rows = [
  [5,'Bob',new Date().toDateString()], // row by array
  {id:6, name: 'Barbara', dob: new Date().toDateString()}
];
// add new rows and return them as array of row of objects
const newRows = sheet.addRows(rows);

workbook.xlsx.writeFile('abc.xlsx');