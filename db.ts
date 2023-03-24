import Excel, { Workbook } from "exceljs";
// import rewritePattern from "regexpu-core";
// import { generateRegexpuOptions } from "@babel/helper-create-regexp-features-plugin/lib/util";

export class DB {
  public filename: string;
  public workbook: any;

  constructor(_filename: string) {
    this.filename = _filename;
    this.workbook = new Excel.Workbook();
  }

  // basic structure of xlsx file:
  // team id|name|rating|matches amount|substitutions (0-5)|rating HLTV|middle rating (2-0)|game id|id_1/id_2|maps amount|
  public addRaw<T>(sheet: string, entity: T) {
    let worksheet = this.workbook.getWorksheet(sheet);

    if (typeof worksheet === "undefined") {
      worksheet = this.workbook.addWorksheet(sheet);

      worksheet.columns = [
        ...Object.keys(entity as Object).map((x: any) => {
          if (x == "id1_id2") {
            return { header: x, key: x, width: x.length + 25 };
          }
          return { header: x, key: x, width: x.length + 5 };
        }),
      ];
    } else {
      // comparison of type of entity and existing columns
      // spoiler: must be equal
      let k: keyof typeof entity;
      for (k in entity)
        if ((worksheet._keys[k] as String) == (entity[k] as String))
          throw "Incompatible types";
    }

    worksheet.addRow(entity);
  }

  public showWorkbook(workbook?: Workbook) {
    let currentWB = typeof workbook === "undefined" ? this.workbook : workbook;

    for (let i = 0; i < currentWB.worksheets.length; i++) {
      for (let j = 1; j <= currentWB.worksheets[i].rowCount; j++) {
        console.log(currentWB.worksheets[i].getRow(j).values.slice(1));
      }
    }
  }

  public async write(fileName: string) {
    await this.workbook.xlsx.writeFile(fileName);
    console.log(`File ${fileName} is written`);
  }

  public async read(fileName: string) {
    const workbook = await this.workbook.xlsx.readFile(fileName);
    this.showWorkbook(workbook);
  }
}
