// @ts-nocheck

function doPost(ev) {
  let ok = true
  let description = undefined

  try {
    // https://developers.google.com/apps-script/guides/web
    const contents = ev.postData.contents

    console.log('contents', contents)

    if (!contents) {
      ok = false
      description = 'post body is empty'
    } else {
      const sheet = SpreadsheetApp.getActive().getSheetByName('LifeLog')
      const columns = sheet.getLastColumn()
      const header = sheet.getRange(1, 1, 1, columns).getValues()[0]

      if (!sheet) throw new Error('"LifeLog" sheet not found')

      const contentRows = JSON.parse(contents).rows

      if (!contentRows || !contentRows.length) {
        throw new Error('data has no rows')
      }

      for (const contentRow of contentRows) {
        const resultRow = new Array(columns)

        for (const [key, value] of Object.entries(contentRow)) {
          const headerIndex = header.indexOf(key)

          if (headerIndex === -1) {
            throw new Error(`Заголовок "${key}" не найден в таблице`)
          }

          resultRow[headerIndex] = headerIndex === 0 ? new Date(value) : value
        }

        sheet.appendRow(resultRow)
      }
    }
  } catch (err) {
    ok = false
    description = err.message
  }

  const output = ContentService.createTextOutput()
    .setMimeType(ContentService.MimeType.JSON)
    .setContent(
      JSON.stringify({
        ok,
        description
      })
    )

  return output
}
