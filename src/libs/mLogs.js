import { createWriteStream, mkdirSync, existsSync } from 'fs';
import moment from 'moment';
import mDump from './mDump';

export default class OrmLog {

    static print(message) {
        const dirPath = './logs'
        const filePath = `${dirPath}/${moment().format('YYYYMMDD')}.morn.log`

        if (!existsSync(dirPath))
            mkdirSync(dirPath)

        if (!this.fileStream || this.fileStream.path != filePath)
            this.fileStream = createWriteStream(filePath, { flags: 'a' })

        const msgDisplayed = mDump(message) + '\n';

        this.fileStream.write(msgDisplayed);
    }
}