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
      const ss = SpreadsheetApp.getActive().getSheetByName('LifeLog')

      if (!ss) throw new Error('"LifeLog" sheet not found')

      const rows = JSON.parse(contents).rows

      if (!rows || !rows.length) {
        throw new Error('data has no rows')
      }

      for (const row of rows) {
        if (!row || row.length !== 2) {
          throw new Error('row shoud have 2 columns')
        }

        const date = new Date(row[0])

        ss.appendRow([date, row[1]])
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
