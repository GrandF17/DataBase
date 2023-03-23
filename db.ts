import ExcelJS from "exceljs";
// import rewritePattern from "regexpu-core";
// import { generateRegexpuOptions } from "@babel/helper-create-regexp-features-plugin/lib/util";

export class DB {
  //   public filename: string;
  //   public workbook: any;

  //   constructor(_filename: string) {
  //     this.filename = _filename;
  //     this.workbook = new ExcelJS.Workbook();
  //   }

  public async write() {
    const Excel = require("exceljs");

    async function exTest() {
      const workbook = new Excel.Workbook();
      const worksheet = workbook.addWorksheet("My Sheet");

      worksheet.columns = [
        { header: "Id", key: "id", width: 10 },
        { header: "Name", key: "name", width: 32 },
        { header: "D.O.B.", key: "dob", width: 15 },
      ];

      worksheet.addRow({ id: 1, name: "John Doe", dob: new Date(1970, 1, 1) });
      worksheet.addRow({ id: 2, name: "Jane Doe", dob: new Date(1965, 1, 7) });

      // save under export.xlsx
      await workbook.xlsx.writeFile("export.xlsx");

      //load a copy of export.xlsx
      const newWorkbook = new Excel.Workbook();
      await newWorkbook.xlsx.readFile("export.xlsx");

      const newworksheet = newWorkbook.getWorksheet("My Sheet");
      newworksheet.columns = [
        { header: "Id", key: "id", width: 10 },
        { header: "Name", key: "name", width: 32 },
        { header: "D.O.B.", key: "dob", width: 15 },
      ];
      await newworksheet.addRow({
        id: 3,
        name: "New Guy",
        dob: new Date(2000, 1, 1),
      });

      await newWorkbook.xlsx.writeFile("export2.xlsx");

      console.log("File is written");
    }

    exTest();
  }
}
