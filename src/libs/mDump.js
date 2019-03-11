import moment from "moment";
import kleur from "kleur";

export default function mDump(str, c = "yellow", withNewLine = true) {
    const msg = `${moment().format('YYYY-MM-DD H:m:s')} ► ${str}`
    const display = kleur[c](msg)
    if (withNewLine)
        console.log(display)
    else
        process.stdout.write(display)
    return msg
}
