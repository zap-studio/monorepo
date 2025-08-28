import { L } from '../helpers/link';
import type { FileList } from '../types';

export const EmailsFiles: FileList = {
  category: 'EMAILS',
  entries: [
    {
      path: 'emails/',
      status: 'added',
      required: false,
      plugins: ['mails'],
      folder: true,
      children: (
        <>
          Contains email templates and allows for easy customization and
          management of email content through a mail server using{' '}
          <L href="https://react.email/">React Email</L>.
        </>
      ),
    },
  ],
};
