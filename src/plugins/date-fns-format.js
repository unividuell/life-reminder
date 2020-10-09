import { format } from 'date-fns'
import { enUS, de } from 'date-fns/locale'

const locales = {enUS, de}

// by providing a default string of 'PP' or any of its variants for `formatStr`
// it will format dates in whichever way is appropriate to the locale
export default function (date, formatStr = 'PP') {
    return format(date, formatStr, {
        locale: locales[window.__localeId__] // or global.__localeId__
    })
}
