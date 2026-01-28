import { Code } from '@/entities/code.entity';
import { User } from '@/entities/user.entity';
import { CodeType } from '@/enum/code_type';

import { orm } from '@/util/orm';
import moment from 'moment';

class CodeUtil {
  public static async genCode(type: CodeType, user: User): Promise<string> {
    const db = (await orm).em.fork();

    const code = (Math.random() + 1).toString(36).substring(2);
    const has = await db.findOne(Code, { code });

    if (!has) {
      const codeObject = new Code();

      codeObject.code = code;
      codeObject.type = type;
      codeObject.user = user;

      if (type === CodeType.AccountActivation)
        codeObject.expiresAt = moment().add(7, 'days').toDate();
      else codeObject.expiresAt = moment().add(15, 'minutes').toDate();

      await db.persist(codeObject).flush();

      return code;
    } else return await this.genCode(type, user);
  }
}

export default CodeUtil;
